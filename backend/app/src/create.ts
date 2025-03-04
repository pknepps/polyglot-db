/**
 * This module is responsible for creating new users, products, and transactions.
 *
 * @author Preston Knepper and Dalton Rogers
 * @version 10/28/2024
 */

// these are the required imports
import { EagerResult } from "neo4j-driver";
import { curr_pid, curr_tid, increment, neoDriver, sanitize, decrement, post_pass } from "./index";
import { UserRecord, ProductRecord, TransactionRecord, User, Product } from "./interfaces";
import { Db } from "mongodb";
import { Pool } from "pg";
import { getPostgressAddress, getPostgressAddressToSend } from "./shard";

/**
 * This is responsible for creating a new user.
 *
 * @param ur The UserRecord object.
 * @param u The User object.
 * @param mongo_db The mongodb database.
 */
export function newUser(ur: UserRecord, u: User, mongo_db: Db) {
    // Sanitization
    ur.firstName = sanitize(ur.firstName);
    ur.lastName = sanitize(ur.lastName);
    ur.username = sanitize(ur.username);
    if (ur.username.length > 50) {
        throw new Error("Username has too many characters");
    }
    if (ur.firstName.length > 50) {
        throw new Error("First name has too many characters");
    }
    if (ur.lastName.length > 50) {
        throw new Error("Last name has too many characters");
    }
    if (getPostgressAddress(ur.firstName)) {
        throw new Error("Username already exists in database.");
    }

    const db = new Pool({
        user: "postgres",
        host: getPostgressAddressToSend(),
        password: post_pass,
        port: 5432,
    });

    // compose the query in an acceptable manner to insert a user record
    let userInsert: string = `INSERT INTO USERS 
        VALUES ('${ur.username}', '${ur.firstName}', '${ur.lastName}');`;
    // do the actual query in the postgreSQL database
    getPostgressAddress(ur.firstName) // TODO: fix id
        .then((addr) => {
            if (addr === null) {
            }
        });
    db.query(userInsert)
        .then((_) => {
            console.log(`Inserted ${ur.username} into USERS`);

            // access the users collection and find the certain username
            return mongo_db.collection("users").findOne({ username: u.username });
        })
        .catch((error) => {
            if (error.code === "23505") {
                console.log(`The username '${ur.username}' already exists, try another username.`);
            } else {
                // general error handling for other types of errors
                console.log("Postgres rejected query", userInsert, "\nwith error: ", error);
            }
        })
        .then((existingUser) => {
            if (existingUser === null) {
                return mongo_db.collection("users").insertOne(u);
            } else {
                return new Promise((_, reject) =>
                    reject(`The username exists within the mongo collection, try another username.`)
                );
            }
        })
        .catch((error) => {
            console.log("Mongodb rejected query with error: ", error);
            return new Promise((_, reject) => reject());
        })
        .then((_) => {
            console.log(`Inserted ${u.username} into MongoDB users collection.`);

            // add the user to the neo4j session
            return neoDriver.executeQuery(`CREATE (u:User {username: "${ur.username}"})`);
        })
        .catch((error) => {
            if (error) {
                console.log("mongodb rejected query with error: ", error);
            }
            return new Promise((_, reject) => reject());
        })
        .then((_) => console.log(`Inserted ${ur.username} into neo4j`))
        .catch((error) => {
            if (error) {
                console.log("Neo4j rejected query with error: ", error);
            }
        });
}

/**
 * This is responsible for creating a new product.
 *
 * @param pr The ProductRecord object.
 * @param p The Product object.
 * @param mongo_db The mongodb database.
 */
export function newProduct(pr: ProductRecord, p: Product, mongo_db: Db) {
    if (pr.name.length > 255) {
        console.log();
        throw new Error("Product name has too many characters.");
    }

    // increment the current pid
    increment("curr_pid");
    pr.productId = curr_pid;
    p.product_id = curr_pid;

    // compose the query to insert a product
    let productInsert: string = `INSERT INTO PRODUCTS 
        VALUES ('${pr.productId}', '${parseFloat(pr.price.toFixed(2))}', '${pr.name}');`;

    // execute the query
    db.query(productInsert)
        .then((_) => {
            console.log(`Inserted ${pr.productId} into PRODUCTS.`);

            // insert the product into the mongodb collection
            return mongo_db.collection("products").findOne({ product_id: p.product_id });
        })
        .catch((err) => {
            console.log("Postgres rejected query: ", productInsert, "\nwith error: ", err);
            decrement("curr_pid");
        })
        .then((existingProduct) => {
            if (existingProduct === null) {
                return mongo_db.collection("products").insertOne(p);
            } else {
                return new Promise((_, reject) =>
                    reject(`The product exists within the mongo collection, try another product_id.`)
                );
            }
        })
        .catch((error) => {
            console.log("mongodb rejected query with error: ", error);
            return new Promise((_, reject) => reject());
        })
        .then((_) => {
            console.log(`Inserted ${p.product_id} into MongoDB products collection.`);

            return neoDriver.executeQuery(`CREATE (p:Product {product_id: $product_id, name: $name, price: $price})`, {
                product_id: pr.productId,
                name: pr.name,
                price: pr.price,
            });
        })
        .catch((error) => {
            if (error) {
                console.log("mongodb rejected query with error: ", error);
                return new Promise((_, reject) => reject());
            }
        })
        .then((_) => console.log(`Inserted ${pr.productId} into neo4j`))
        .catch((error) => {
            if (error) {
                console.log("Neo4j rejected query with error: ", error);
            }
        });
}

/**
 * Creates a new transaction based on the input data.
 *
 * @param t The TransactionRecord object that contains the transactionId, username, productId,
 * card num, address, city, state, and zip.
 * @param mongo_db The mongo database to query.
 * @returns A Promise that is either resolved or rejected depending on the outcome of the query.
 */
export function newTransaction(t: TransactionRecord, mongo_db: Db) {
    // increment the transaction id
    increment("curr_tid");
    t.transactionId = curr_tid;

    // compose the query in an acceptable manner to insert a transaction
    let transactionInsert: string = `INSERT INTO TRANSACTIONS VALUES ('${t.transactionId}',
            '${t.username}', '${t.productId}', '${t.cardNum}', '${t.address}', '${t.city}', 
            '${t.state}', '${t.zip}');`;

    // execute the query
    db.query(transactionInsert)
        .then((_) => {
            console.log(`Inserted ${curr_tid} into TRANSACTIONS`);
            // if the transaction is able to be updated successfully then we need to update the
            // corresponding user's information

            // the address object and payment object
            const address = {
                address: t.address,
                city: t.city,
                state: t.state,
                zip: t.zip,
            };
            const payment = { cardnum: t.cardNum };

            // access and update the users when a transaction is made
            return mongo_db.collection("users").updateOne(
                { username: t.username },
                {
                    $addToSet: {
                        transactions: t.transactionId,
                        addresses: address,
                        payments: payment,
                    },
                }
            );
        })
        .catch((error) => {
            if (error.code) {
                console.log("Postgres rejected query: ", transactionInsert, "\nwith error: ", error);
            } else {
                console.error("Unexpected error while updating the user after a transaction:", error);
            }
            return new Promise((_, reject) => reject());
        })
        .then((_) => {
            console.log(`User updated with transaction ID ${curr_tid}.`);

            return neoDriver.executeQuery(
                `MATCH (u:User {username: $username}) 
                    MATCH (p:Product {product_id: $product_id}) 
                    CREATE (u)-[:BOUGHT]->(p)`,
                { username: t.username, product_id: t.productId }
            );
        })
        .catch((error) => {
            console.log("mongodb rejected query with error: ", error);

            return new Promise<EagerResult>((_, reject) => reject());
        })
        .then((_) => console.log(`Made transaction between ${t.username} and ${t.productId} into neo4j`))
        .catch((error) => {
            if (error) {
                console.log("Neo4j rejected query with error: ", error);
            }
        });
}
