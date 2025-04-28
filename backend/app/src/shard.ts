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

dbMap.mongoDB.set("pknepps.net", 0);

// caches connections to databases
export const mongoConnections: Map<string, Db> = new Map();

export async function makeConnections() {
    for (let [address, _] of dbMap.mongoDB) {
        try {
            mongoConnections.set(address, await connectMongo(address));
        } catch (e) {
            console.error(`Could not connect to MongoDB at ${address}: `, e)
        }
    }
}

/**
 * Helper method which calculates the best existing shard to send new data to.
 * @param db The name of the field in the DBMap interface to search through
 * @returns The address of the shard to send new data to
 */
// function getAddressToSend(): string {
//     let min: [string, number] = ["", Number.MAX_VALUE];
//     for (let entry of dbMap.mongoDB) {
//         if (entry[1] < min[1]) {
//             min = entry;
//         }
//     }
//     min[1]++;
//     return min[0];
// }
function getAddressToSend(): string {
    const dbMap = (global as any).dbMap?.mongoDB;
    if (!dbMap || dbMap.size === 0) {
        return ""; 
    }

    let leastItemsShard = "";
    let leastItems = Infinity;

    for (const [shard, itemCount] of dbMap.entries()) {
        if (itemCount < leastItems) {
            leastItems = itemCount;
            leastItemsShard = shard;
        }
    }

    return leastItemsShard;
}

/**
 * Calculates the best existing MongoDB shard to send new data to.
 * @returns The address of the MongoDB shard to send new data to.
 */
export function getMongoAddressToSend(): string {
    return getAddressToSend();
}

/**
 * Queries Redis for the address of the Mongo database which holds the item
 * of the given id.
 * @param id The id of the item to query for.
 * @returns The address of the host which holds the data.
 */
export async function getMongoAddress(id: string): Promise<string | null> {
    return (await redis).get(id);
}

export async function setMongoAddress(id: string, address: string) {
    await redis.set(id, address);
}

export async function registerDb(address: string): Promise<void> {
    if (mongoConnections.has(address)) {
        return;
    }
    try {
        mongoConnections.set(address, await connectMongo(address));
        dbMap.mongoDB.set(address, 0); // TODO this should probably be how many things are in the db.
    } catch (e) {
        console.error(`Could not connect to MongoDB at ${address}: `, e)
        throw e;
    }
}