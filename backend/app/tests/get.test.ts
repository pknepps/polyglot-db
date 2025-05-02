import { getUser, getProduct, getProductByName, getTransaction, getProducts, getAllProducts, getPostgresData, getNeoGraph, getRedisData } from '../src/get';
import { redis, db } from "../src";
import { getMongoAddress, mongoConnections } from '../src/shard';
import { Db } from 'mongodb';
import { pullIntoCache } from "../src/cache";
import { neoDriver } from "../src/index";

jest.mock("../src", () => ({
    redis: {
        keys: jest.fn(),
        get: jest.fn(),
    },
    db: {
        query: jest.fn(),
    },
    neoDriver: {
        session: jest.fn(), 
    },
}));
jest.mock('../src/shard', () => ({
    getMongoAddress: jest.fn(),
    mongoConnections: new Map(),
}));
jest.mock("../src/cache", () => ({
    pullIntoCache: jest.fn(),
}));

afterEach(() => {
    jest.clearAllMocks();
    (mongoConnections as Map<string, Db>).clear();
});

/**
 * Test for getUser function.
 */
describe('getUser function', () => {
    let mockMongoDb: Db;

    beforeEach(() => {
        mockMongoDb = {
            collection: jest.fn().mockReturnValue({
                findOne: jest.fn(),
            }),
        } as unknown as Db;

        (getMongoAddress as jest.Mock).mockResolvedValue('mockAddress');
        (mongoConnections as Map<string, Db>).set('mockAddress', mockMongoDb);
    });

    afterEach(() => {
        jest.clearAllMocks();
        (mongoConnections as Map<string, Db>).clear();
    });

    test('should return user data when the user exists', async () => {
        const mockUser = { username: 'testUser', firstName: 'Test', lastName: 'User', middleName: "",  addresses: [], payments: [], transactions: [], ratings: [], reviews: []};
        (mockMongoDb.collection('users').findOne as jest.Mock).mockResolvedValue(mockUser);

        const result = await getUser('testUser');

        expect(getMongoAddress).toHaveBeenCalledWith('utestUser');
        expect(mockMongoDb.collection('users').findOne).toHaveBeenCalledWith({ username: 'testUser' });
        expect(result).toEqual(mockUser);
    });

    test('should reject when the user does not exist', async () => {
        (mockMongoDb.collection('users').findOne as jest.Mock).mockResolvedValue(null);

        await expect(getUser('nonExistentUser')).rejects.toBeUndefined();

        expect(getMongoAddress).toHaveBeenCalledWith('unonExistentUser');
        expect(mockMongoDb.collection('users').findOne).toHaveBeenCalledWith({ username: 'nonExistentUser' });
    });

    test('should reject when an error occurs', async () => {
        (getMongoAddress as jest.Mock).mockRejectedValue(new Error('Connection error'));

        await expect(getUser('errorUser')).rejects.toBeUndefined();

        expect(getMongoAddress).toHaveBeenCalledWith('uerrorUser');
        expect(mockMongoDb.collection('users').findOne).not.toHaveBeenCalled();
    });
});

/**
 * Test for getProduct function.
 */
describe("getProduct function", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (mongoConnections as Map<string, Db>).clear();
    });

    test("should return the product from Redis if it exists", async () => {
        const mockProduct = { product_id: 1, name: "Test Product" };
        (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(mockProduct));

        const result = await getProduct(1);

        expect(redis.get).toHaveBeenCalledWith("1");
        expect(result).toEqual(mockProduct);
    });

    test("should fetch the product from MongoDB if it does not exist in Redis", async () => {
        const mockProduct = { product_id: 1, name: "Test Product" };
        const mockDb = {
            collection: jest.fn().mockReturnValue({
                findOne: jest.fn().mockResolvedValue(mockProduct),
            }),
        } as unknown as Db;

        (redis.get as jest.Mock).mockResolvedValue(null);
        (mongoConnections as Map<string, Db>).set("mockAddress", mockDb);
        const getMongoAddress = require("../src/shard").getMongoAddress;
        getMongoAddress.mockResolvedValue("mockAddress");

        const result = await getProduct(1);

        expect(redis.get).toHaveBeenCalledWith("1");
        expect(getMongoAddress).toHaveBeenCalledWith("p1");
        expect(mockDb.collection).toHaveBeenCalledWith("products");
        expect(result).toEqual(mockProduct);
        expect(pullIntoCache).toHaveBeenCalledWith(1, mockDb);
    });

    test("should resolve to undefined if the product does not exist in Redis or MongoDB", async () => {
        const mockDb = {
            collection: jest.fn().mockReturnValue({
                findOne: jest.fn().mockResolvedValue(null),
            }),
        } as unknown as Db;
    
        (redis.get as jest.Mock).mockResolvedValue(null);
        (mongoConnections as Map<string, Db>).set("mockAddress", mockDb);
        const getMongoAddress = require("../src/shard").getMongoAddress;
        getMongoAddress.mockResolvedValue("mockAddress");
    
        const result = await getProduct(1);
    
        expect(result).toBeNull(); // Expect the result to be undefined
        expect(redis.get).toHaveBeenCalledWith("1");
        expect(getMongoAddress).toHaveBeenCalledWith("p1");
        expect(mockDb.collection).toHaveBeenCalledWith("products");
    });
});

/**
 * Test for getProductByName function.
 */
describe("getProductByName function", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (mongoConnections as Map<string, Db>).clear();
    });

    test("should return an empty array if no products match the name", async () => {
        const mockDb = {
            collection: jest.fn().mockReturnValue({
                find: jest.fn().mockReturnValue({
                    toArray: jest.fn().mockResolvedValue([]),
                }),
            }),
        } as unknown as Db;

        (mongoConnections as Map<string, Db>).set("mockAddress", mockDb);

        const result = await getProductByName("NonExistent");

        expect(result).toEqual([]);
        expect(mockDb.collection).toHaveBeenCalledWith("products");
        expect(mockDb.collection("products").find).toHaveBeenCalledWith({ name: expect.any(RegExp) });
    });
});

import * as getModule from "../src/get";

/**
 * Test for getTransaction function.
 */
describe("getTransaction function", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should return the transaction details if the transaction exists", async () => {
        const mockTransaction = {
            transaction_id: 1,
            username: "test_user",
            amount: 100,
        };
        (db.query as jest.Mock).mockResolvedValue({ rows: [mockTransaction] });

        const result = await getTransaction(1);

        expect(db.query).toHaveBeenCalledWith(
            "SELECT * FROM TRANSACTIONS WHERE transaction_id = $1;",
            [1]
        );
        expect(result).toEqual({ rows: [mockTransaction] }); 
    });

    test("should reject if the transaction does not exist", async () => {
        (db.query as jest.Mock).mockResolvedValue({ rows: [] });
    
        await expect(getTransaction(999)).resolves.toEqual({ rows: [] }); 
        expect(db.query).toHaveBeenCalledWith(
            "SELECT * FROM TRANSACTIONS WHERE transaction_id = $1;",
            [999]
        );
    });

    test("should return a mock transaction (spy version)", async () => {
        const mockTransaction = {
            transaction_id: 1,
            username: "mock_user",
            amount: 42,
        };

        jest.spyOn(getModule, "getTransaction").mockResolvedValue(mockTransaction);

        const result = await getModule.getTransaction(1);

        expect(result).toEqual(mockTransaction);
    });
});

/**
 * Test for getProducts function.
 */
describe("getProducts function", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (mongoConnections as Map<string, Db>).clear();
    });

    test("should return the first n products from the database", async () => {
        const mockProducts = [
            { product_id: 1, name: "Product 1" },
            { product_id: 2, name: "Product 2" },
        ];
        const mockDb = {
            collection: jest.fn().mockReturnValue({
                find: jest.fn().mockReturnValue({
                    limit: jest.fn().mockReturnValue({
                        toArray: jest.fn().mockResolvedValue(mockProducts),
                    }),
                }),
            }),
        } as unknown as Db;

        (mongoConnections as Map<string, Db>).set("pknepps.net", mockDb);

        const result = await getProducts(2);

        expect(result).toEqual(mockProducts);
        expect(mockDb.collection).toHaveBeenCalledWith("products");
        expect(mockDb.collection("products").find).toHaveBeenCalled();
        expect(mockDb.collection("products").find().limit).toHaveBeenCalledWith(2);
    });

    test("should return an empty array if no products exist", async () => {
        const mockDb = {
            collection: jest.fn().mockReturnValue({
                find: jest.fn().mockReturnValue({
                    limit: jest.fn().mockReturnValue({
                        toArray: jest.fn().mockResolvedValue([]),
                    }),
                }),
            }),
        } as unknown as Db;

        (mongoConnections as Map<string, Db>).set("pknepps.net", mockDb);

        const result = await getProducts(2);

        expect(result).toEqual([]);
        expect(mockDb.collection).toHaveBeenCalledWith("products");
        expect(mockDb.collection("products").find).toHaveBeenCalled();
        expect(mockDb.collection("products").find().limit).toHaveBeenCalledWith(2);
    });

    test("should reject if the database query fails", async () => {
        const mockDb = {
            collection: jest.fn().mockReturnValue({
                find: jest.fn().mockReturnValue({
                    limit: jest.fn().mockReturnValue({
                        toArray: jest.fn().mockRejectedValue(new Error("Database error")),
                    }),
                }),
            }),
        } as unknown as Db;

        (mongoConnections as Map<string, Db>).set("pknepps.net", mockDb);

        await expect(getProducts(2)).rejects.toThrow("Database error");
        expect(mockDb.collection).toHaveBeenCalledWith("products");
        expect(mockDb.collection("products").find).toHaveBeenCalled();
        expect(mockDb.collection("products").find().limit).toHaveBeenCalledWith(2);
    });
});

/**
 * Test getAllProducts function.
 */
describe("getAllProducts function", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (mongoConnections as Map<string, Db>).clear();
    });

    test("should return all products from all MongoDB shards", async () => {
        const mockProductsShard1 = [
            { product_id: 1, name: "Product 1" },
            { product_id: 2, name: "Product 2" },
        ];
        const mockProductsShard2 = [
            { product_id: 3, name: "Product 3" },
            { product_id: 4, name: "Product 4" },
        ];

        const mockDbShard1 = {
            collection: jest.fn().mockReturnValue({
                find: jest.fn().mockReturnValue({
                    toArray: jest.fn().mockResolvedValue(mockProductsShard1),
                }),
            }),
        } as unknown as Db;

        const mockDbShard2 = {
            collection: jest.fn().mockReturnValue({
                find: jest.fn().mockReturnValue({
                    toArray: jest.fn().mockResolvedValue(mockProductsShard2),
                }),
            }),
        } as unknown as Db;

        (mongoConnections as Map<string, Db>)
            .set("shard1", mockDbShard1)
            .set("shard2", mockDbShard2);

        const result = await getAllProducts();

        expect(result).toEqual([...mockProductsShard1, ...mockProductsShard2]);
        expect(mockDbShard1.collection).toHaveBeenCalledWith("products");
        expect(mockDbShard1.collection("products").find).toHaveBeenCalled();
        expect(mockDbShard2.collection).toHaveBeenCalledWith("products");
        expect(mockDbShard2.collection("products").find).toHaveBeenCalled();
    });

    test("should return an empty array if no products exist in any shard", async () => {
        const mockDb = {
            collection: jest.fn().mockReturnValue({
                find: jest.fn().mockReturnValue({
                    toArray: jest.fn().mockResolvedValue([]),
                }),
            }),
        } as unknown as Db;

        (mongoConnections as Map<string, Db>)
            .set("shard1", mockDb)
            .set("shard2", mockDb);

        const result = await getAllProducts();

        expect(result).toEqual([]);
        expect(mockDb.collection).toHaveBeenCalledWith("products");
        expect(mockDb.collection("products").find).toHaveBeenCalledTimes(2); // Called for each shard
    });
});

/**
 * Test for getPostgresData function.
 */
describe("getPostgresData function", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should return product data with transactions when a product ID is provided", async () => {
        const mockData = [
            {
                productid: 1,
                name: "Test Product",
                price: 100,
                transactions: [
                    { transaction_id: 1, username: "user1" },
                    { transaction_id: 2, username: "user2" },
                ],
            },
        ];
        (db.query as jest.Mock).mockResolvedValue({ rows: mockData });

        const result = await getPostgresData(1);

        expect(db.query).toHaveBeenCalledWith(
            expect.stringContaining("WHERE p.product_id = $1"),
            [1]
        );
        expect(result).toEqual([
            {
                ProductID: 1,
                Name: "Test Product",
                Price: 100,
                Transactions: [
                    { transaction_id: 1, username: "user1" },
                    { transaction_id: 2, username: "user2" },
                ],
            },
        ]);
    });

    test("should return all product data with transactions when no product ID is provided", async () => {
        const mockData = [
            {
                productid: 1,
                name: "Product 1",
                price: 50,
                transactions: [
                    { transaction_id: 1, username: "user1" },
                ],
            },
            {
                productid: 2,
                name: "Product 2",
                price: 75,
                transactions: [],
            },
        ];
        (db.query as jest.Mock).mockResolvedValue({ rows: mockData });
    
        const result = await getPostgresData();
    
        expect(db.query).toHaveBeenCalledWith(expect.any(String));
        expect((db.query as jest.Mock).mock.calls[0][0]).toContain("LEFT JOIN transactions");
    
        expect(result).toEqual([
            {
                ProductID: 1,
                Name: "Product 1",
                Price: 50,
                Transactions: [
                    { transaction_id: 1, username: "user1" },
                ],
            },
            {
                ProductID: 2,
                Name: "Product 2",
                Price: 75,
                Transactions: [],
            },
        ]);
    });

    test("should return an empty array when no data is found", async () => {
        (db.query as jest.Mock).mockResolvedValue({ rows: [] });
    
        const result = await getPostgresData(999);
    
        expect(result).toEqual([]);
    });

    test("should throw an error if the database query fails", async () => {
        (db.query as jest.Mock).mockRejectedValue(new Error("Database error"));

        await expect(getPostgresData(1)).rejects.toThrow("Database error");
        expect(db.query).toHaveBeenCalledWith(
            expect.stringContaining("WHERE p.product_id = $1"),
            [1]
        );
    });
});

/**
 * Test for getRedisData function.
 */
describe("getRedisData function", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should return cached data and shard information when a product ID is provided", async () => {
        (redis.keys as jest.Mock).mockResolvedValue(["1", "2"]);
        (redis.get as jest.Mock).mockResolvedValueOnce("Product 1").mockResolvedValueOnce("Product 2");
        (getMongoAddress as jest.Mock).mockResolvedValue("mockAddress");

        const result = await getRedisData(1);

        expect(redis.keys).toHaveBeenCalledWith("[0-9]*");
        expect(redis.get).toHaveBeenCalledTimes(2);
        expect(redis.get).toHaveBeenCalledWith("1");
        expect(redis.get).toHaveBeenCalledWith("2");
        expect(getMongoAddress).toHaveBeenCalledWith("p1");
        expect(result).toEqual({
            cachedData: [
                ["1", "Product 1"],
                ["2", "Product 2"],
            ],
            shard: ["p1", "mockAddress"],
        });
    });

    test("should return cached data and null shard when no product ID is provided", async () => {
        (redis.keys as jest.Mock).mockResolvedValue(["1", "2"]);
        (redis.get as jest.Mock).mockResolvedValueOnce("Product 1").mockResolvedValueOnce("Product 2");

        const result = await getRedisData();

        expect(redis.keys).toHaveBeenCalledWith("[0-9]*");
        expect(redis.get).toHaveBeenCalledTimes(2);
        expect(redis.get).toHaveBeenCalledWith("1");
        expect(redis.get).toHaveBeenCalledWith("2");
        expect(getMongoAddress).not.toHaveBeenCalled();
        expect(result).toEqual({
            cachedData: [
                ["1", "Product 1"],
                ["2", "Product 2"],
            ],
            shard: null,
        });
    });

    test("should throw an error if Redis keys query fails", async () => {
        (redis.keys as jest.Mock).mockRejectedValue(new Error("Redis error"));

        await expect(getRedisData()).rejects.toThrow("Redis error");

        expect(redis.keys).toHaveBeenCalledWith("[0-9]*");
        expect(redis.get).not.toHaveBeenCalled();
        expect(getMongoAddress).not.toHaveBeenCalled();
    });

    test("should throw an error if Redis get query fails", async () => {
        (redis.keys as jest.Mock).mockResolvedValue(["1", "2"]);
        (redis.get as jest.Mock).mockRejectedValue(new Error("Redis get error"));

        await expect(getRedisData()).rejects.toThrow("Redis get error");

        expect(redis.keys).toHaveBeenCalledWith("[0-9]*");
        expect(redis.get).toHaveBeenCalledTimes(2);
        expect(getMongoAddress).not.toHaveBeenCalled();
    });
});