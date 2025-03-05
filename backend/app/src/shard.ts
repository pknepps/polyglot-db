import { readFileSync } from "fs";
import { createClient } from "redis";
import { post_pass, redis } from ".";
import { Pool } from "pg";
import { Db } from "mongodb";
import { Driver } from "neo4j-driver";

/**
 * A frequency map of each type of database which holds each shard address and
 * the number of items it stores.
 */
interface DBMap {
    postgresMap: Map<string, number>;
    mongoMap: Map<string, number>;
    neo4jMap: Map<string, number>;
}

const dbMap: DBMap = {
    postgresMap: new Map(),
    mongoMap: new Map(),
    neo4jMap: new Map(),
};

// caches connections to databases
export const pgConnections: Map<string, Pool> = new Map();
export const mongoConnections: Map<string, Db> = new Map();
export const neo4jConnections: Map<string, Driver> = new Map();

// TODO: hardcoded addresses, we need to find a way to add them.
dbMap.postgresMap.set("pknepps.net", 0);
dbMap.mongoMap.set("pknepps.net", 0);
dbMap.neo4jMap.set("pknepps.net", 0);

/**
 * Helper method which calculates the best existing shard to send new data to.
 * @param db The name of the field in the DBMap interface to search through
 * @returns The address of the shard to send new data to
 */
function getAddressToSend(db: "postgresMap" | "mongoMap" | "neo4jMap"): string {
    let map;
    if (db === "postgresMap") {
        map = dbMap.postgresMap;
    } else if (db === "mongoMap") {
        map = dbMap.mongoMap;
    } else {
        map = dbMap.neo4jMap;
    }
    let min: [string, number] = ["", Number.MAX_VALUE];
    for (let entry of map) {
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
export function getPostgressConnection(): Pool {
    const addr = getAddressToSend("postgresMap");
    if (pgConnections.get(addr) === undefined) {
        pgConnections.set(
            addr,
            new Pool({
                user: "postgres",
                host: addr,
                password: post_pass,
                port: 5432,
            })
        );
    }
    return pgConnections.get(addr)!;
}

function syncPostgressConnectionMap() {
    if (pgConnections.size !== dbMap.postgresMap.size) {
        for (let addr of dbMap.postgresMap.keys()) {
            if (pgConnections.get(addr) === undefined) {
                pgConnections.set(
                    addr,
                    new Pool({
                        user: "postgres",
                        host: addr,
                        password: post_pass,
                        port: 5432,
                    })
                );
            }
        }
    }
}

export function getAllPostgressConnections(): Pool[] {
    syncPostgressConnectionMap();
    return Array.from(pgConnections.values());
}

/**
 * Calculates the best existing MongoDB shard to send new data to.
 * @returns The address of the MongoDB shard to send new data to.
 */
export function getMongoConnection(): string {
    return getAddressToSend("mongoMap");
}

/**
 * Calculates the best existing Neo4j shard to send new data to.
 * @returns The address of the Neo4j shard to send new data to.
 */
export function getNeo4jAddressToSend(): string {
    return getAddressToSend("neo4jMap");
}

/**
 * Helper method which queries Redis for the address of the shard which holds
 * the item of the given id.
 * @param id The id of the item to query for.
 * @param db The database name which the item is loated.
 * @returns The address of the host which holds the data.
 */
async function getAddress(id: string, db: string): Promise<string | null> {
    return redis.get(db + id);
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

export function getAllMongoAddresses() {
    return dbMap.mongoMap.keys();
}

export function getAllPostgresAddresses() {
    return dbMap.postgresMap.keys();
}

export function getAllNeo4jAddresses() {
    return dbMap.neo4jMap.keys();
}
