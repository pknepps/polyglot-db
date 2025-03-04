/**
 * This module is used to get the information from mongoDB.
 *
 * @author Dalton Rogers and Preston Knepper
 * @version 11/12/2024
 */

// import the required modules and libraries
import { Db } from "mongodb";
import { getMongoAddressToSend, getPostgressAddressToSend } from "./shard";
import { post_pass } from ".";
import { Client } from "pg";

/**
 * Find and return a user based on a provided username.
 *
 * @param un The username that we are searching for.
 * @param mongodb The mongoDB that we are looking in.
 * @returns A promise, either resolves the query result or rejects.
 */
export async function getUser(un: string, mongodb: Db) {
    const ip = getMongoAddressToSend();
    try {
        return await mongodb.collection("users").findOne({ username: un });
    } catch (error) {
        console.log("The user does not exist.");
        throw error;
    }
}

/**
 * Find and return a product based on a provided product id.
 *
 * @param pi The product id that we are searching for.
 * @param mongodb The mongoDB that we are looking in.
 * @returns A promise, either resolves the query result or rejects.
 */
export async function getProduct(pi: number, mongodb: Db) {
    try {
        return await mongodb.collection("products").findOne({ product_id: pi });
    } catch (error) {
        console.log("The product does not exist.");
        throw error;
    }
}

/**
 * Find and return a transaction based on a provided transaction id.
 *
 * @param ti The transaction id that we are searching for.
 * @returns A promise, either resolves the query result or rejects.
 */
export async function getTransaction(ti: number) {
    const address = getPostgressAddressToSend();
    const db = new Client({
        user: "postgres",
        host: address,
        password: post_pass,
        port: 5432,
    });
    await db.connect();
    try {
        let q = "SELECT * FROM TRANSACTIONS WHERE transaction_id = " + String(ti) + ";";
        const queryResult = await db.query(q);
        await db.end();
        return queryResult;
    } catch (error) {
        console.log("Error performing transaction.");
        throw error;
    }
}

/**
 * Returns the first n products in the database.
 * @param n The number of products to get.
 * @param mongodb The mongo database to query
 */
export async function getProducts(n: number, mongodb: Db) {
    try {
        return mongodb.collection("products").find({}).limit(n).toArray();
    } catch (e) {
        console.log(`There was a problem querying products from MongoDB, ${e}`);
        throw e;
    }
}
