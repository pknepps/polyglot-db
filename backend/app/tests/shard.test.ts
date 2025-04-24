import { getMongoAddressToSend, getMongoAddress, setMongoAddress, registerDb, makeConnections, mongoConnections } from "../src/shard";
import { redis } from "../src";
import { Db } from "mongodb";

jest.mock("../src", () => ({
    connectMongo: jest.fn(async (address: string) => ({ address } as unknown as Db)),
    redis: {
        get: jest.fn(),
        set: jest.fn(),
    },
}));

/**
 * Test the shard.ts module.
 */
describe("shard.ts", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mongoConnections.clear();
    });

    /**
     * Test the getMongoAddressToSend function.
     */
    describe("getMongoAddressToSend", () => {
        it("should return the address of the shard with the least items", () => {
            const dbMapMock = new Map([
                ["shard1", 5],
                ["shard2", 2],
                ["shard3", 8],
            ]);
            (global as any).dbMap = { mongoDB: dbMapMock };

            const address = getMongoAddressToSend();
            expect(address).toBe("shard2");
            expect(dbMapMock.get("shard2")).toBe(3); 
        });
    });

    /**
     * Test the getMongoAddress function.
     */
    describe("getMongoAddress", () => {
        it("should return the address of the shard holding the given id", async () => {
            (redis.get as jest.Mock).mockResolvedValue("shard1");

            const address = await getMongoAddress("item123");
            expect(redis.get).toHaveBeenCalledWith("item123");
            expect(address).toBe("shard1");
        });

        it("should return null if the id is not found in Redis", async () => {
            (redis.get as jest.Mock).mockResolvedValue(null);

            const address = await getMongoAddress("item123");
            expect(redis.get).toHaveBeenCalledWith("item123");
            expect(address).toBeNull();
        });
    });

    /**
     * Test the setMongoAddress function.
     */
    describe("setMongoAddress", () => {
        it("should set the address of the shard for the given id in Redis", async () => {
            await setMongoAddress("item123", "shard1");
            expect(redis.set).toHaveBeenCalledWith("item123", "shard1");
        });
    });

    /**
     * Test the registerDb function.

     */
    describe("registerDb", () => {
        it("should register a new MongoDB shard and initialize its count to 0", async () => {
            await registerDb("shard1");
            expect(mongoConnections.has("shard1")).toBe(true);
            expect((global as any).dbMap.mongoDB.get("shard1")).toBe(0);
        });

        it("should not register a shard if it is already registered", async () => {
            mongoConnections.set("shard1", {} as Db);
            await registerDb("shard1");
            expect(mongoConnections.size).toBe(1);
        });

        it("should throw an error if the connection fails", async () => {
            const error = new Error("Connection failed");
            (global as any).connectMongo = jest.fn().mockRejectedValue(error);

            await expect(registerDb("shard1")).rejects.toThrow(error);
        });
    });

    /**
     * Test the makeConnections function.
     */
    describe("makeConnections", () => {
        it("should establish connections to all MongoDB shards in dbMap", async () => {
            const dbMapMock = new Map([
                ["shard1", 5],
                ["shard2", 2],
            ]);
            (global as any).dbMap = { mongoDB: dbMapMock };

            await makeConnections();
            expect(mongoConnections.has("shard1")).toBe(true);
            expect(mongoConnections.has("shard2")).toBe(true);
        });

        it("should log an error if a connection fails", async () => {
            const error = new Error("Connection failed");
            (global as any).connectMongo = jest.fn().mockImplementationOnce(() => {
                throw error;
            });
            const dbMapMock = new Map([["shard1", 5]]);
            (global as any).dbMap = { mongoDB: dbMapMock };

            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
            await makeConnections();
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "Could not connect to MongoDB at shard1: ",
                error
            );
            consoleErrorSpy.mockRestore();
        });
    });
});