/**
 * This file is responsible for the insertion of data into the users, products,
 * and transactions tables within the Postgres database.
 *
 * @Author Preston Knepper and Dalton Rogers
 * @Version 9/19/2024
 */

// these are the required imports
import { createClient } from "redis";
import {Pool} from 'pg';
import {readFileSync} from 'fs';
import * as readline from 'readline/promises';
import {Db, MongoClient} from "mongodb";
import neo4j from 'neo4j-driver';
import express from "express";
import {createRouter} from "./api";
import cors from "cors";
import { makeConnections } from "./shard";

// gets the postgres password from a file
export const post_pass: string = readFileSync("./POSTGRES_PASSWORD", "utf-8");
export const neo_pass: string = readFileSync("./NEO4J_PASSWORD", "utf-8");
export const mong_pass: string = readFileSync("./MONGODB_PASSWORD", "utf-8");
export const redisPass: string = readFileSync("./REDIS_PASSWORD", "utf-8");

// redis for sharding
//@ts-ignore
export let redis;

export const db = new Pool({
    user: 'postgres',
    host: 'pknepps.net',
    password: post_pass,
    port: 5432
});

// creates a neo4j driver
export const neoDriver = neo4j.driver(
    'neo4j://pknepps.net:7687',
    neo4j.auth.basic('neo4j', neo_pass)
);

/**
 * This is responsible for establishing a connection to Mongo. 
 * 
 * @returns If connection is successful then returns the mongodb database.
 */
export async function connectMongo(address: string): Promise<Db> {
    let mongodb: Db | null = null;
    try {
        // gets the mongodb password from a file

        // the parts needed to create mongodb connection
        const mong_uri: string = "mongodb://mongo:" + mong_pass + `@${address}/?authSource=admin`;
        const dbName = "polyglots-db";

        // create a new mongo client
        const client = new MongoClient(mong_uri);

        // console.log(client);
        // connect to the client
        try {
            await client.connect();
        } catch (e) {
            console.log("There was an error making the connection to mongodb: ", e);
        }

        // return the desired database
        mongodb = client.db(dbName);
        return mongodb;
        // catch and handle any errors trying to connect to mongo
    } catch (err) {
        console.log("Error connecting to MongoDb", err);
        throw err;
    }
}

export async function connectRedis() {
    // the parts needed to create redis connection
    // use a connection string in the format redis[s]://[[username][:password]@][host][:port][/db-number]:
    const redisUri: string = "redis://:" + redisPass + "@pknepps.net";

    const redis = createClient({ url: redisUri });

    // log an error message for connection errors
    redis.on("error", (err: any) => console.log("Redis Client Error", err));

    // connect to server
    await redis.connect();

    return redis;
}

/**
 * Sanitize the strings before they go into Postgres.
 * @param str The String that needs to be sanitized.
 * @returns The sanitized string.
 */
export function sanitize(str: String){
    if (typeof str !== "string") {
        return "";
    }
    return str.replace(/["'`]/g, "^");
}

/**
 * This function is responsible for initializing the connection to each of the databases. 
 * It then calls the interact method so the user can perform operations on the databases.
 */
export async function start() {
    redis = await connectRedis();
    try {
        try {
            await makeConnections();
            console.log('Connection to mongodb established')
            try {
                const serverInfo = await neoDriver.getServerInfo()
                console.log('Connection to neo4j established')
                console.log(serverInfo)
              } catch(err) {
                console.log(`Connection error\n${err}`)
              }
            // pass in mongodb as argument to interact
            const app = express();
            const port = process.env.PORT || 8000;
            app.use(cors());
            app.use(express.json());
            app.use("/api/", createRouter());
            app.listen(port, () => {
                console.log(`Server running at http://localhost:${port}`);
            });
        } catch (e) {
            console.log("Unable to connect to mongodb.\n", e);
        }
    } catch (e) {
        console.log("An error happened when trying to get the current transaction and product ids: ", e)
    }
}

// call to initialize the database
start();