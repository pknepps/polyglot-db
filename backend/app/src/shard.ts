import { readFileSync } from "fs";
import { createClient } from "redis";

/** 
 * A frequency map of each type of database which holds each shard address and 
 * the number of items it stores.
 */
interface DBMap {
    postgres: Map<string, number>,
    mongoDB: Map<string, number>,
    neo4j: Map<string, number>,
}

const dbMap: DBMap = {
    postgres: new Map(),
    mongoDB: new Map(),
    neo4j: new Map(),
}

const redis = connectRedis();

async function connectRedis() {
    // gets the redis password from a file
    const redisPass: string = readFileSync("./REDIS_PASSWORD", "utf-8");

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
 * Helper method which calculates the best existing  shard to send new data to.
 * @param db The name of the field in the DBMap interface to search through 
 * @returns The address of the  shard to send new data to
 */
function getAddressToSend(db: "postgres" | "mongoDB" | "neo4j"): string {
    let min: [string, number] = ["", Number.MAX_VALUE];
    for (let entry of dbMap[db]) {
        if (entry[1] < min[1]) {
            min = entry;
        }
    }
    return min[0];
}

/**
 * Calculates the best existing Postgres shard to send new data to.
 * @returns The address of the Postgres shard to send new data to
 */
export function getPostgressAddressToSend(): string {
    return getAddressToSend("postgres");
}


/**
 * Calculates the best existing MongoDB shard to send new data to.
 * @returns The address of the MongoDB shard to send new data to.
 */
export function getMongoAddressToSend(): string {
    return getAddressToSend("mongoDB");
}

/**
 * Calculates the best existing Neo4j shard to send new data to.
 * @returns The address of the Neo4j shard to send new data to.
 */
export function getNeo4jAddressToSend(): string {
    return getAddressToSend("neo4j");
}

/**
 * Helper method which queries Redis for the address of the shard which holds 
 * the item of the given id.
 * @param id The id of the item to query for.
 * @param db The database name which the item is loated.
 * @returns The address of the host which holds the data.
 */
async function getAddress(id: string, db: string): Promise<string | null> {
    return (await redis).get(db + id);
}

/**
 * Queries Redis for the address of the Postgres database which holds the item 
 * of the given id.
 * @param id The id of the item to query for.
 * @returns The address of the host which holds the data.
 */
export async function getPostgressAddress(id: string): Promise<string | null> {
    return getAddress(id, "postgres");
}


/**
 * Queries Redis for the address of the Mongo database which holds the item 
 * of the given id.
 * @param id The id of the item to query for.
 * @returns The address of the host which holds the data.
 */
export async function getMongoAddress(id: string): Promise<string | null> {
    return getAddress(id, "mongoDB");
}

/**
 * Queries Redis for the address of the Neo4j database which holds the item 
 * of the given id.
 * @param id The id of the item to query for.
 * @returns The address of the host which holds the data.
 */
export async function getNeo4jAddress(id: string): Promise<string | null> {
    return getAddress(id, "neo4j");
}

/**
 * Stores the address of the given item id in the redis database.
 * @param id The id of the item to store.
 * @param db The database name the item is stored in.
 * @param address The address the item is located in.
 */
async function setAddress(id: string, db: "postgres" | "mongoDB" | "neo4j", address: string) {
    const frequency = dbMap[db].get(address);
    dbMap[db].set(address, frequency || 0);
    (await redis).set(db + id, address);
}

/**
 * Stores the address of the given item id (stored in a Postgres shard) in the redis database.
 * @param id The id of the item to store.
 * @param address The address the item is located in.
 */
export async function setPostgressAddress(id: string, address: string) {
    setAddress(id, "postgres", address);
}

/**
 * Stores the address of the given item id (stored in a MongoDB shard) in the redis database.
 * @param id The id of the item to store.
 * @param address The address the item is located in.
 */
export async function setMongoAddress(id: string, address: string) {
    setAddress(id, "mongoDB", address);
}

/**
 * Stores the address of the given item id (stored in a Neo4j shard) in the redis database.
 * @param id The id of the item to store.
 * @param address The address the item is located in.
 */
export async function setNeo4jAddress(id: string, address: string) {
    setAddress(id, "neo4j", address);
}

/**
 * Helper which gets each unique address of the given database shards.
 * @param db The database name.
 * @returns A list of addresses.
 */
async function getAllAddresses(db: "postgres" | "mongoDB" | "neo4j"): Promise<string[]> {
    const keys: string[] = await (await redis).keys(db + "*");
    return [...new Set(keys)];
}

/**
 * Helper which gets each unique address of the Postgres shards.
 * @param db The database name.
 * @returns A list of addresses.
 */
export async function getAllPostgresAddresses(): Promise<string[]> {
    return getAllAddresses("postgres");
}

/**
 * Helper which gets each unique address of the MongoDB shards.
 * @returns A list of addresses.
 */
export async function getAllMongoAddresses(): Promise<string[]> {
    return getAllAddresses("mongoDB");
}

/**
 * Helper which gets each unique address of the Neo4j shards.
 * @returns A list of addresses.
 */
export async function getAllNeo4jAddresses(): Promise<string[]> {
    return getAllAddresses("neo4j");
}