/**
 * This file is responsible for the insertion of data into the users, products,
 * and transactions tables within the Postgres database.
 *
 * @Author Preston Knepper and Dalton Rogers
 * @Version 9/19/2024
 */

// these are the required imports
import { randProduct, randRatings, randReviews, randTransaction, randUser } from "./generators";
import { Product, ProductRecord, TransactionRecord, User, UserRecord } from "./interfaces";
import { newProduct, newTransaction, newUser } from "./create";
import { addRating, addReview } from "./update";
import { Client } from "pg";
import { readFileSync } from "fs";
import * as readline from "readline/promises";
import { Db, MongoClient } from "mongodb";
import neo4j from "neo4j-driver";
import { recommend_from_product } from "./recommend";
import express from "express";
import { createRouter } from "./api";
import cors from "cors";
import { createClient } from "redis";
import { getAllPostgresAddresses } from "./shard";

// this is used to interact with the user on the command line
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// gets the postgres password from a file
export const post_pass: string = readFileSync("./POSTGRES_PASSWORD", "utf-8");
export const neo_pass: string = readFileSync("./NEO4J_PASSWORD", "utf-8");
export const mong_pass: string = readFileSync("./MONGODB_PASSWORD", "utf-8");
export const redisPass: string = readFileSync("./REDIS_PASSWORD", "utf-8");

// redis for sharding
//@ts-ignore
export let redis;

// gets the postgres password from a file

// creates a neo4j driver
export const neoDriver = neo4j.driver("neo4j://pknepps.net:7687", neo4j.auth.basic("neo4j", neo_pass));

/**
 * This is responsible for establishing a connection to Mongo.
 *
 * @returns If connection is successful then returns the mongodb database.
 */
async function connectMongo(): Promise<Db> {
    let mongodb: Db | null = null;
    try {
        // gets the mongodb password from a file

        // the parts needed to create mongodb connection
        const mong_uri: string = "mongodb://mongo:" + mong_pass + "@pknepps.net/?authSource=admin";
        const dbName = "polyglots-db";

        // create a new mongo client
        const client = new MongoClient(mong_uri);

        // connect to the client
        try {
            await client.connect();
        } catch (e) {
            console.log("There was an error making the connection to mongodb: ", e);
        }

        // return the desired database
        mongodb = client.db(dbName);

        // catch and handle any errors trying to connect to mongo
    } catch (err) {
        console.log("Error connecting to MongoDb", err);
    }
    return new Promise((resolve, reject) => {
        if (mongodb === null) {
            reject();
        } else {
            resolve(mongodb!);
        }
    });
}

async function connectRedis() {
    // the parts needed to create redis connection
    // use a connection string in the format redis[s]://[[username][:password]@][host][:port][/db-number]:
    const redisUri: string = "redis://:" + redisPass + "@pknepps.net";

    const redis = createClient({ url: redisUri });

    // log an error message for connection errors
    redis.on("error", (err) => console.log("Redis Client Error", err));

    // connect to server
    await redis.connect();

    return redis;
}

/**
 * This is a helper function for interact that performs the necessary things to
 * insert a user.
 *
 * @param mongo_db The mongodb database.
 */
async function caseOne(mongo_db: Db) {
    // insert the new user
    try {
        // get the needed information to create a user
        const username = await rl.question("Enter username: ");
        const firstName = await rl.question("Enter first name: ");
        const lastName = await rl.question("Enter last name: ");
        const middleName = await rl.question("Enter middle name: ");

        // create a User object
        const user: User = {
            username: username,
            firstName: firstName,
            lastName: lastName,
            middleName: middleName,
            addresses: [],
            payments: [],
            transactions: [],
            ratings: [],
            reviews: [],
        };
        // create the corresponding record
        const user_record: UserRecord = {
            username: username,
            firstName: firstName,
            lastName: lastName,
        };
        newUser(user_record, user, mongo_db);
    } catch (error) {
        console.log("Error inserting user: ", error);
    }
}

/**
 * This is a helper function for interact that performs the necessary things to
 * insert a product.
 *
 * @param mongo_db The mongodb database.
 */
async function caseTwo(mongo_db: Db) {
    let price: number = -1;
    let validPrice = false;
    // insert the new product
    try {
        // loop until valid price is entered
        while (!validPrice) {
            const priceInput = await rl.question("Enter product price: ");
            price = Number(priceInput);

            if (!isNaN(price) && price > 0) {
                validPrice = true;
            } else {
                console.log("Invalid price. Please enter a valid number greater than 0.");
            }
        }
        // get the needed information to create a product
        const name = await rl.question("Enter product name: ");
        // create a Product object and ProductRecord object
        // with a placeholder productid (updated when the newProduct is called)
        const product: Product = {
            product_id: 69,
            name: name,
            price: price,
            ratings: [],
            reviews: [],
        };
        const product_record: ProductRecord = {
            productId: 69,
            price: Number(price),
            name: name,
        };
        // pass the products off
        newProduct(product_record, product, mongo_db);
    } catch (error) {
        console.log("Error inserting product: ", error);
    }
}

/**
 * This is a helper function for interact that performs the necessary things to
 * insert a transaction.
 *
 * @param mongo_db The mongodb database.
 */
async function caseThree(mongo_db: Db) {
    let validTransaction = false;

    const postgresAddrs = getAllPostgresAddresses();
    const dbs = await Promise.all(
        Array.from(postgresAddrs).map(async (addr) => {
            const db = new Client({
                user: "postgres",
                host: addr,
                password: post_pass,
                port: 5432,
            });
            await db.connect();
            return db;
        })
    );

    while (!validTransaction) {
        try {
            const username1 = await rl.question("Enter a valid username: ");
            const product_id1 = await rl.question("Enter a valid product id: ");

            // Check if username exists
            const userCheck = (
                await Promise.all(
                    dbs.map((db) =>
                        db
                            .query(`SELECT * FROM USERS WHERE username = $1`, [username1])
                            .then((result) => result.rowCount === 1)
                    )
                )
            ).reduce((prev, current) => prev || current);
            const productCheck = (
                await Promise.all(
                    dbs.map((db) =>
                        db
                            .query(`SELECT * FROM PRODUCTS WHERE product_id = $1`, [product_id1])
                            .then((result) => result.rowCount === 1)
                    )
                )
            ).reduce((prev, current) => prev || current);

            for (let db of dbs) {
                db.end();
            }

            if (!userCheck && !productCheck) {
                // proceed to gather transaction details
                const card_num = await rl.question("Enter a card number: ");
                const address = await rl.question("Enter an address: ");
                const city = await rl.question("Enter a city: ");
                const state = await rl.question("Enter a state: ");
                const zip = await rl.question("Enter a zip: ");

                // create the transaction object
                const transaction: TransactionRecord = {
                    username: username1,
                    productId: Number(product_id1),
                    cardNum: Number(card_num),
                    address: address,
                    city: city,
                    state: state,
                    zip: Number(zip),
                    transactionId: 0,
                };

                // Insert the new transaction
                try {
                    newTransaction(transaction, mongo_db);
                } catch (error) {
                    console.log("Error inserting transaction: ", error);
                }
                validTransaction = true; // Exit the loop after successful insertion
            } else {
                console.log("Either the username or the product ID is not valid. Please try again.");
            }
        } catch (e) {
            console.log("An exception happened while waiting for a response from user: ");
        }
    }
}

/**
 * This is a helper function for interact that creates new ratings and reviews
 * to be added.
 *
 * @param mongo_db The mongodb database.
 */
async function caseFour(mongo_db: Db) {
    try {
        const username = await rl.question("Enter a valid username: ");
        const product_id: number = Number(await rl.question("Enter a valid product id: "));
        const rating: number = Number(await rl.question("Enter a rating (1-5): "));
        const review = await rl.question("Enter a review: ");
        const rateview = { username, product_id, rating, review };
        addRating(rateview, mongo_db);
        addReview(rateview, mongo_db);
    } catch (e) {
        console.log("Exception updating ratings and reviews: ", e);
    }
}

/**
 * This is a helper function for interact that creates random entries to be added
 * to the datasets.
 *
 * @param mongo_db The mongodb database.
 */
async function caseFive(mongo_db: Db) {
    try {
        const decision = (await rl.question("Data will be inserted into which table: ")).toLowerCase();
        const quantityInput = await rl.question("How many random entries: ");
        const quantity = parseInt(quantityInput);
        switch (decision) {
            case "users":
                for (let i = 0; i < quantity; i++) {
                    let [userRecord, user] = randUser();
                    newUser(userRecord, user, mongo_db);
                }
                console.log(`Inserted ${quantity} random users into the USERS table.`);
                break;
            case "products":
                for (let i = 0; i < quantity; i++) {
                    let [productRecord, product] = randProduct();
                    newProduct(productRecord, product, mongo_db);
                }
                console.log(`Inserted ${quantity} random products into the PRODUCTS table.`);
                break;
            case "transactions":
                randTransaction(quantity)
                    .then((result) => {
                        result.map((transaction) => newTransaction(transaction, mongo_db));
                        console.log(`Inserted ${quantity} random transactions into the TRANSACTIONS table.`);
                    })
                    .catch((e) => console.log("An exception has occurred while inserting into transactions: " + e));
                break;
            case "ratings":
            case "reviews":
                randRatings(quantity)
                    .then((result) => {
                        result.map((rating) => addRating(rating, mongo_db));
                        console.log(`Added ${quantity} random ratings to users and products.`);
                    })
                    .catch((e) => console.log("An exception has occurred while updating users and products: ", e));
                randReviews(quantity)
                    .then((result) => {
                        result.map((review) => addReview(review, mongo_db));
                        console.log(`Added ${quantity} random reviews to users and products.`);
                    })
                    .catch((e) => console.log("An exception has occurred while updating users and products: ", e));
                break;
            default:
                console.log(
                    "Invalid table name. Please choose 'users', 'products', \
                'transactions', 'ratings', or 'reviews."
                );
                break;
        }
    } catch (error) {
        console.log("Error creating object: ", error);
    }
}

async function caseSix() {
    const decision = await rl.question("Enter an existing product_id: ");
    const product_id = parseInt(decision);
    const products = await recommend_from_product(product_id);
    console.log("We also recommend: ");
    for (let product of products) {
        console.log(`\t${product.product_id}: ${product.name} | \$${product.price}`);
    }
}

/**
 * Sanitize the strings before they go into Postgres.
 * @param str The String that needs to be sanitized.
 * @returns The sanitized string.
 */
export function sanitize(str: String) {
    return str.replace(/["'`]/g, "^");
}

/**
 * This function gives the ability to interact from the command line.
 * Legacy code
 * @param mongo_db The mongodb database.
 */
async function interact(mongo_db: Db) {
    let output: string = `Please make a numerical choice from below: 
     [0] Quit
     [1] Insert User
     [2] Insert Product
     [3] Insert Transaction
     [4] Insert Rating/Review
     [5] Insert Random Data
     [6] Recommended Products`;
    output += "\nChoice: ";

    while (true) {
        try {
            // user choice
            const answer = await rl.question(output);
            console.log();
            // what we do according to each choice
            switch (answer) {
                // exit the menu
                case "0":
                    console.log("Goodbye");
                    rl.close();
                    process.exit();
                    break;
                // create a user
                case "1":
                    await caseOne(mongo_db);
                    break;
                // create a product
                case "2":
                    await caseTwo(mongo_db);
                    break;
                case "3":
                    await caseThree(mongo_db);
                    break;
                case "4":
                    await caseFour(mongo_db);
                    break;
                case "5":
                    await caseFive(mongo_db);
                    break;
                case "6":
                    await caseSix();
                    break;
                default:
                    // console.log('Not a valid choice!');
                    break;
            }
        } catch {
            console.log("user input failed on main select");
        }
    }
}

/**
 * This function is responsible for initializing the connection to each of the databases.
 * It then calls the interact method so the user can perform operations on the databases.
 */
async function start() {
    redis = await connectRedis();
    try {
        try {
            const mongodb = await connectMongo();
            console.log("Connection to mongodb established");
            try {
                const serverInfo = await neoDriver.getServerInfo();
                console.log("Connection to neo4j established");
                console.log(serverInfo);
            } catch (err) {
                console.log(`Connection error\n${err}`);
            }
            // pass in mongodb as argument to interact
            const app = express();
            const port = process.env.PORT || 8000;
            app.use(cors());
            app.use(express.json());
            app.use("/api/", createRouter(mongodb));
            app.listen(port, () => {
                console.log(`Server running at http://localhost:${port}`);
            });
        } catch (e) {
            console.log("Unable to connect to mongodb.\n", e);
        }
    } catch (e) {
        console.log("An error happened when trying to get the current transaction and product ids: ", e);
    }
}

// call to initialize the database
start();
