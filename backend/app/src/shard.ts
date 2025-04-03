import { connectMongo, redis } from ".";
import { Db } from "mongodb";

/**
 * A frequency map of each type of database which holds each shard address and
 * the number of items it stores.
 */
interface DBMap {
    mongoDB: Map<string, number>,
}

const dbMap: DBMap = {
    mongoDB: new Map(),
}

// caches connections to databases
export const mongoConnections: Map<string, Db> = new Map();

// TODO: hardcoded addresses, we need to find a way to add them.
dbMap.mongoDB.set("pknepps.net", 0);

export async function makeConnections() {
    for (let [address, _] of dbMap.mongoDB) {
        mongoConnections.set(address, await connectMongo(address));
    }
}

/**
 * Helper method which calculates the best existing shard to send new data to.
 * @param db The name of the field in the DBMap interface to search through
 * @returns The address of the shard to send new data to
 */
function getAddressToSend(): string {
    let min: [string, number] = ["", Number.MAX_VALUE];
    for (let entry of dbMap.mongoDB) {
        if (entry[1] < min[1]) {
            min = entry;
        }
    }
    min[1]++;
    return min[0];
}

/**
 * Calculates the best existing MongoDB shard to send new data to.
 * @returns The address of the MongoDB shard to send new data to.
 */
export function getMongoAddressToSend(): string {
    return getAddressToSend();
}

/**
 * Helper method which queries Redis for the address of the shard which holds
 * the item of the given id.
 * @param id The id of the item to query for.
 * @param db The database name which the item is loated.
 * @returns The address of the host which holds the data.
 */
async function getAddress(id: string): Promise<string | null> {
    return (await redis).get(id);
}

/**
 * Queries Redis for the address of the Mongo database which holds the item
 * of the given id.
 * @param id The id of the item to query for.
 * @returns The address of the host which holds the data.
 */
export async function getMongoAddress(id: string): Promise<string | null> {
    return getAddress(id);
}

export async function setMongoAddress(id: string, address: string) {
    await redis.set(id, address);
}