import { pullIntoCache } from "../src/cache";
import { redis } from "../src/index";
import { recommend_from_product } from "../src/recommend";
import { Db, Collection } from "mongodb";
import { getMongoAddress, mongoConnections } from "../src/shard";

// Mock dependencies
jest.mock("../src", () => ({
    redis: {
        get: jest.fn(),
        set: jest.fn(),
        setEx: jest.fn(),
    },
    connectMongo: jest.fn(),
}));

jest.mock("../src/shard", () => ({
    getMongoAddress: jest.fn(),
    mongoConnections: {
        get: jest.fn(),
    },
}));

// Mock the recommend_from_product function
jest.mock("../src/recommend", () => ({
    recommend_from_product: jest.fn(),
}));

/**
 * Test the pullIntoCache function.
 */
describe("pullIntoCache", () => {
    let mockMongoDB: Partial<Db>;
    let mockCollection: Partial<Collection>;

    beforeEach(() => {
        mockCollection = {
            findOne: jest.fn(),
        };

        mockMongoDB = {
            collection: jest.fn().mockReturnValue(mockCollection),
        };

        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should cache the main product and its recommended products", async () => {
        const productId = 1;
        const mainProduct = { product_id: productId, name: "Main Product" };
        const recommendedProducts = [
            { product_id: 2, name: "Recommended Product 1" },
            { product_id: 3, name: "Recommended Product 2" },
        ];
    
        (mockCollection.findOne as jest.Mock)
            .mockResolvedValueOnce(mainProduct)           // for main product
            .mockResolvedValueOnce(recommendedProducts[0]) // for recommended 1
            .mockResolvedValueOnce(recommendedProducts[1]); // for recommended 2
    
        (recommend_from_product as jest.Mock).mockResolvedValueOnce(recommendedProducts);
    
        (getMongoAddress as jest.Mock).mockResolvedValue("mock-address");
        (mongoConnections.get as jest.Mock).mockReturnValue(mockMongoDB);
    
        await pullIntoCache(productId, mockMongoDB as Db);
    
        await new Promise(setImmediate);

        expect(redis.setEx).toHaveBeenCalledWith(
            `${productId}`,
            300,
            JSON.stringify(mainProduct)
        );

        expect(mockMongoDB.collection).toHaveBeenCalledWith("products");
        expect(mockCollection.findOne).toHaveBeenCalledWith({ product_id: productId });
        expect(redis.setEx).toHaveBeenCalledWith(
            `${productId}`,
            300,
            JSON.stringify(mainProduct)
        );
    
        for (const recommendedProduct of recommendedProducts) {
            expect(redis.setEx).toHaveBeenCalledWith(
                `${recommendedProduct.product_id}`,
                45,
                JSON.stringify(recommendedProduct)
            );
        }

    });

    test("should handle errors gracefully", async () => {
        const productId = 1;
        (mockCollection.findOne as jest.Mock).mockRejectedValueOnce(new Error("Database error"));

        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        await pullIntoCache(productId, mockMongoDB as Db);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining(`An error occured when trying to pull product ${productId} into cache`)
        );

        consoleErrorSpy.mockRestore();
    });
});