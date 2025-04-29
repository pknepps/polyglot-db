/**
 * This module is responsible for creating new users, products, and transactions.
 *
 * @author Preston Knepper and Dalton Rogers
 * @version 10/28/2024
 */

// these are the required imports
import { neoDriver, sanitize, db, redis } from "./index";
import { UserRecord, ProductRecord, TransactionRecord, User, Product } from "./interfaces";
import { setMongoAddress, getMongoAddress, getMongoAddressToSend, mongoConnections } from "./shard";
import { Db } from "mongodb";
import "assert";
import { error } from "console";

/**
 * This is responsible for creating a new user.
 *
 * @param ur The UserRecord object.
 * @param u The User object.
 * @param mongo_db The mongodb database.
 */
export async function newUser(ur: UserRecord, u: User) {
    // Sanitization
    ur.firstName = sanitize(ur.firstName);
    ur.lastName = sanitize(ur.lastName);
    ur.username = sanitize(ur.username);
    let mongoAddress = getMongoAddressToSend();
    let mongo_db = mongoConnections.get(mongoAddress)!;

    if (ur.username.length > 50) {
        throw new Error("Username has too many characters");
    }
    if (ur.firstName.length > 50) {
        throw new Error("First name has too many characters");
    }
    if (ur.lastName.length > 50) {
        throw new Error("Last name has too many characters");
    }

    // compose the query in an acceptable manner to insert a user record
    let userInsert: string = `INSERT INTO USERS VALUES ($1, $2, $3);`;
    // do the actual query in the postgreSQL database
    return db
        .query(userInsert, [ur.username, ur.firstName, ur.lastName])
        .then(() => console.log(`Inserted ${ur.username} into USERS`))
        .catch((error) => {
            if (error.code === "23505") {
                console.log(`The username '${ur.username}' already exists, try another username.`);
            } else {
                // general error handling for other types of errors
                console.log("Postgres rejected query", userInsert, "\nwith error: ", error);
            }
            throw error;
        })
        .then(() => mongo_db.collection("users").findOne({ username: u.username }))
        .then(async (existingUser) => {
            if (existingUser === null) {
                await mongo_db.collection("users").insertOne(u);
                await setMongoAddress("u" + ur.username, mongoAddress);
                return console.log(`Inserted ${u.username} into MongoDB users collection.`);
            } else {
                throw new Error(`The username exists within the mongo collection, try another username.`);
            }
        })
        .then(() =>
            // add the user to the neo4j session
            neoDriver
                .executeQuery(`CREATE (u:User {username: $username})`, {username: ur.username}, {database: "neo4j"})
                .then(() => console.log(`Inserted ${ur.username} into neo4j`))
        )
        .catch((error) => {
            console.log("An error occured when adding a user: ", error);
            throw error;
        });
}

/**
 * This is responsible for creating a new product.
 *
 * @param pr The ProductRecord object.
 * @param p The Product object.
 * @param mongo_db The mongodb database.
 */
export async function newProduct(pr: ProductRecord, p: Product) {
    if (pr.name.length > 255) {
        throw new Error("Product name has too many characters.");
    }
    let mongoAddress = getMongoAddressToSend();
    let mongo_db: Db = mongoConnections.get(mongoAddress)!;
    if (!mongo_db) {
        throw error("mongo_db is null")
    }
    // increment the current pid
    const curr_pid = await redis.incr("curr_product_id");
    pr.productId = curr_pid;
    p.product_id = curr_pid;

    // compose the query to insert a product
    let productInsert: string = `INSERT INTO PRODUCTS VALUES ($1, $2, $3);`;

    // execute the query
    return db
        .query(productInsert, [pr.productId, parseFloat(pr.price.toFixed(2)), pr.name])
        .then(() => console.log(`Inserted ${pr.productId} into PRODUCTS.`))
        .catch(async (err) => {
            console.log("Postgres rejected query: ", productInsert, "\nwith error: ", err);
            await redis.decr("curr_product_id");
            throw err;
        })
        .then(async () => {
            await mongo_db.collection("products").insertOne(p);
            await setMongoAddress("p" + pr.productId, mongoAddress);
            return console.log(`Inserted ${p.product_id} into MongoDB products collection.`);
        })
        .then(() =>
            neoDriver
                .executeQuery(`CREATE (p:Product {product_id: $product_id, name: $name, price: $price})`, {
                    product_id: pr.productId,
                    name: pr.name,
                    price: pr.price,
                }, {database: "neo4j"})
                .then(() => console.log(`Inserted ${pr.productId} into neo4j`))
                .catch((error) => {
                    console.log("Neo4j rejected query with error: ", error);
                    throw error;
                })
        )
        .catch((err) => {
            console.log("An error occured while adding new product: ", err);
            throw err;
        })
}

/**
 * Creates a new transaction based on the input data.
 *
 * @param t The TransactionRecord object that contains the transactionId, username, productId,
 * card num, address, city, state, and zip.
 * @param mongo_db The mongo database to query.
 * @returns A Promise that is either resolved or rejected depending on the outcome of the query.
 */
export async function newTransaction(t: TransactionRecord) {
    // increment the transaction id
    const curr_tid = await redis.incr("curr_transaction_id");
    t.transactionId = curr_tid;

    // compose the query in an acceptable manner to insert a transaction
    let transactionInsert: string = `INSERT INTO TRANSACTIONS VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`;

    // execute the query
    return db
        .query(transactionInsert, [t.transactionId, t.username, t.productId, t.cardNum, t.address, t.city, t.state, t.zip])
        .then(() => console.log(`Inserted ${curr_tid} into TRANSACTIONS`))
        .catch(async (error) => {
            if (error.code) {
                console.log("Postgres rejected query: ", transactionInsert, "\nwith error: ", error);
            } else {
                console.error("Unexpected error while updating the user after a transaction:", error);
            }
            await redis.decr("curr_transaction_id");
            throw error;
        })
        // if the transaction is able to be updated successfully then we need to update the
        // corresponding user's information
        // the address object and payment object
        .then(async () => {
            const address = {
                address: t.address,
                city: t.city,
                state: t.state,
                zip: t.zip,
            };
            const payment = { cardnum: t.cardNum };
            const mongo_address = await getMongoAddress("u" + t.username)
            if (mongo_address == null) {
                throw "Address does not exist for user: " + t.username
            }
            const mongo_db = mongoConnections.get(mongo_address);
            // access and update the users when a transaction is made
            return mongo_db!
                .collection("users")
                .updateOne(
                    { username: t.username },
                    {
                        $addToSet: {
                            transactions: t.transactionId,
                            addresses: address,
                            payments: payment,
                        },
                    }
                )
                .then(() => console.log(`User updated with transaction ID ${curr_tid}.`));
        })
        .then(() =>
            neoDriver
                .executeQuery(
                    `MATCH (u:User {username: $username}) 
                MATCH (p:Product {product_id: $product_id}) 
                CREATE (u)-[:BOUGHT]->(p)`,
                    { username: t.username, product_id: t.productId }, {database: "neo4j"}
                )
                .then(() => console.log(`Made transaction between ${t.username} and ${t.productId} into neo4j`))
        )
        .catch((error) => {
            console.log("An error occured while adding new product: ", error);
            throw error;
        })
}
