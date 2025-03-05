/**
 * This module is used to get the information from mongoDB. 
 * 
 * @author Dalton Rogers and Preston Knepper
 * @version 11/12/2024
 */

// import the required modules and libraries
import {Db} from "mongodb";
import {db, neoDriver} from "./index";
import {Product} from "./interfaces";

/**
 * Find and return a user based on a provided username.
 * 
 * @param un The username that we are searching for.
 * @param mongodb The mongoDB that we are looking in.
 * @returns A promise, either resolves the query result or rejects.
 */
export async function getUser(un: string, mongodb: Db){
    try{
        return await mongodb.collection("users").findOne({username: un});
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
export async function getProduct(pi: number, mongodb: Db){
    try{
        return await mongodb.collection("products").findOne({product_id: pi});
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
export async function getTransaction(ti: number){
    try{
        let q = "SELECT * FROM TRANSACTIONS WHERE transaction_id = " + String(ti) + ";";
        return await db.query(q);
    } catch (error) {
        console.log("The transaction does not exist.");
        return new Promise((_, reject) => reject());
    }
}

/**
 * Returns the first n products in the database.
 * 
 * @param n The number of products to get.
 * @param mongodb The mongo database to query.
 */
export async function getProducts(n: number, mongodb: Db) {
    try {
        return mongodb.collection("products").find({}).limit(n).toArray();
    } catch (e) {
        console.log(`There was a problem querying products from MongoDB, ${e}`)
        return new Promise((_, reject) => reject());
    }
}

/**
 * Returns the count of documents in the products collection.
 * 
 * @param mongodb The mongo database to query
 * @returns The count of documents in the products collection.
 */
export async function getAllProducts(mongodb: Db) {
    try {
        return mongodb.collection("products").find({}).toArray();
    } catch (e) {
        console.log(`There was a problem querying products from MongoDB, ${e}`)
        return new Promise((_, reject) => reject());
    }
}

/**
 * Returns the result of the neo4j query for a specidic product.
 * 
 * @param pid The product number we are looking at.
 * @returns The product and its connected nodes.
 */
export async function getNeoGraph(pid: number) {
    let session = neoDriver.session();
    try {
        let result = await session.run("MATCH (p:Product {product_id: $pid})-[r]-(b) RETURN p, r, b", {pid});
        result.records.forEach(record => {
            const p = record.get('p');
            const b = record.get('b');
            const r = record.get('r');

            console.log('Product Node:', p.properties);
            console.log('Related Node:', b.properties);
            console.log('Relationship:', r.type);
        });
        // return result.records;
    } catch (e) {
        console.log(`There was a problem querying the Neo4j graph, ${e}`)
        return new Promise((_, reject) => reject());
    } finally {
        session.close();
    }
}