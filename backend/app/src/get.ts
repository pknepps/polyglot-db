/**
 * This module is used to get the information from mongoDB.
 *
 * @author Dalton Rogers and Preston Knepper
 * @version 11/12/2024
 */

// import the required modules and libraries
import { Db } from "mongodb";
import { Product } from "./interfaces";
import { getMongoAddress, getPostgressAddress } from "./shard";
import { post_pass } from ".";
import { Pool } from "pg";

/**
 * Find and return a user based on a provided username.
 *
 * @param un The username that we are searching for.
 * @param mongodb The mongoDB that we are looking in.
 * @returns A promise, either resolves the query result or rejects.
 */
export async function getUser(un: string, mongodb: Db) {
    const ip = await getMongoAddress(un);
    try {
        return await mongodb.collection("users").findOne({ username: un });
    } catch (error) {
        console.log("The user does not exist.");
        return new Promise((_, reject) => reject());
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
        return new Promise((_, reject) => reject());
    }
}

/**
 * Find and return a transaction based on a provided transaction id.
 *
 * @param ti The transaction id that we are searching for.
 * @returns A promise, either resolves the query result or rejects.
 */
export async function getTransaction(ti: number) {
    const address = await getPostgressAddress(ti.toString());
    const db = new Pool({
        user: "postgres",
        host: address,
        password: post_pass,
        port: 5432,
    });
    try {
        let q = "SELECT * FROM TRANSACTIONS WHERE transaction_id = " + String(ti) + ";";
        return await db.query(q);
    } catch (error) {
        console.log("The transaction does not exist.");
        return new Promise((_, reject) => reject());
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
        return new Promise((_, reject) => reject());
    }
}
