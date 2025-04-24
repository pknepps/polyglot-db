import { getMongoAddressToSend, getMongoAddress, setMongoAddress, registerDb, makeConnections, mongoConnections } from "../src/shard";
import { redis } from "../src";
import { connectMongo } from "../src";
import { Db } from "mongodb";

jest.mock("../src", () => ({
    redis: {
        get: jest.fn(),
        set: jest.fn(),
    },
    connectMongo: jest.fn(),
}));

describe("shard.ts", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mongoConnections.clear();
    });

    /**
     * Test the getMongoAddressToSend function.

     */
    describe("getMongoAddressToSend function", () => {
        test("should return the address of the shard with the least items", () => {
            const mockDbMap = new Map<string, number>();
            mockDbMap.set("shard1", 5);
            mockDbMap.set("shard2", 3);
            mockDbMap.set("shard3", 7);
            (global as any).dbMap = { mongoDB: mockDbMap }; 
        
            const result = getMongoAddressToSend();
            expect(result).toBe("shard2");
        });
    });

    /**
     * Test the getMongoAddress function.   

     */
    describe("getMongoAddress function", () => {
        test("should return the address of the shard holding the item with the given id", async () => {
            (redis.get as jest.Mock).mockResolvedValue("shard1");

            const result = await getMongoAddress("item123");
            expect(result).toBe("shard1");
            expect(redis.get).toHaveBeenCalledWith("item123");
        });

        test("should return null if the item is not found in Redis", async () => {
            (redis.get as jest.Mock).mockResolvedValue(null);

            const result = await getMongoAddress("item123");
            expect(result).toBeNull();
            expect(redis.get).toHaveBeenCalledWith("item123");
        });
    });

    /**
     * Test the setMongoAddress function.

     */
    describe("setMongoAddress function", () => {
        test("should set the address of the shard holding the item with the given id in Redis", async () => {
            await setMongoAddress("item123", "shard1");

            expect(redis.set).toHaveBeenCalledWith("item123", "shard1");
        });
    });

    /**
     * Test the registerDb function.

     */
    describe("registerDb function", () => {
        test("should register a new MongoDB shard and initialize its connection", async () => {
            const mockDb = {} as Db;
            (connectMongo as jest.Mock).mockResolvedValue(mockDb);

            await registerDb("shard1");

            expect(connectMongo).toHaveBeenCalledWith("shard1");
            expect(mongoConnections.get("shard1")).toBe(mockDb);
        });

        test("should not register a shard if it is already registered", async () => {
            const mockDb = {} as Db;
            mongoConnections.set("shard1", mockDb);

            await registerDb("shard1");

            expect(connectMongo).not.toHaveBeenCalled();
        });

        test("should throw an error if the connection fails", async () => {
            (connectMongo as jest.Mock).mockRejectedValue(new Error("Connection failed"));

            await expect(registerDb("shard1")).rejects.toThrow("Connection failed");
        });
    });

    /**
     * Test the makeConnections function.
     */
    describe("makeConnections functions", () => {
        test("should establish connections to all registered MongoDB shards", async () => {
            const mockDb = {} as Db;
            (connectMongo as jest.Mock).mockResolvedValue(mockDb);

            const mockDbMap = new Map([
                ["shard1", 5]
            ]);
            (global as any).dbMap = { mongoDB: mockDbMap };

            await makeConnections();

            expect(connectMongo).toHaveBeenCalledTimes(1);
            expect(connectMongo).toHaveBeenCalledWith("shard1");
            expect(mongoConnections.get("shard1")).toBe(mockDb);
        });

        test("should not establish connections if no shards are registered", async () => {
            const mockDbMap = new Map<string, number>();
            (global as any).dbMap = { mongoDB: mockDbMap };

            await makeConnections();

            expect(connectMongo).toHaveBeenCalled();
        });


        test("should log an error if a connection fails", async () => {
            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
            (connectMongo as jest.Mock).mockRejectedValue(new Error("Connection failed"));

            const mockDbMap = new Map([["shard1", 5]]);
            (global as any).dbMap = { mongoDB: mockDbMap };

            await makeConnections();

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "Could not connect to MongoDB at shard1: ",
                expect.any(Error)
            );

            consoleErrorSpy.mockRestore();
        });
    });
});