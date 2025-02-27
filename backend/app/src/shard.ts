/** 
 * A frequency map of each type of database which holds each shard address and 
 * the number of items it stores.
 */
interface DBMap {
    postgresMap: Map<string, number>,
    mongoMap: Map<string, number>,
    neo4jMap: Map<string, number>,
}

const dbMap: DBMap = {
    postgresMap: new Map(),
    mongoMap: new Map(),
    neo4jMap: new Map(),
}

/**
 * Helper method which calculates the best existing  shard to send new data to.
 * @param db The name of the field in the DBMap interface to search through 
 * @returns The address of the  shard to send new data to
 */
function getAddressToSend(db: string): string {
    let min: [string, number] = ["", Number.MAX_VALUE];
    for (let entry of dbMap["postgresMap"]) {
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
    return getAddressToSend("postgresMap");
}


/**
 * Calculates the best existing MongoDB shard to send new data to.
 * @returns The address of the MongoDB shard to send new data to.
 */
export function getMongoAddressToSend(): string {
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
async function getAddress(id: string, db: string): Promise<string> {
    return "pknepps.net"
}

/**
 * Queries Redis for the address of the Postgres database which holds the item 
 * of the given id.
 * @param id The id of the item to query for.
 * @returns The address of the host which holds the data.
 */
export async function getPostgressAddress(id: string): Promise<string> {
    return getAddress(id, "postgres");
}


/**
 * Queries Redis for the address of the Mongo database which holds the item 
 * of the given id.
 * @param id The id of the item to query for.
 * @returns The address of the host which holds the data.
 */
export async function getMongoAddress(id: string): Promise<string> {
    return getAddress(id, "mongoDB");
}

/**
 * Queries Redis for the address of the Neo4j database which holds the item 
 * of the given id.
 * @param id The id of the item to query for.
 * @returns The address of the host which holds the data.
 */
export async function getNeo4jAddress(id: string): Promise<string> {
    return getAddress(id, "neo4j");
}
