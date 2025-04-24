import { pullIntoCache } from "../src/cache";
import { redis } from "../src/index";
import { recommend_from_product } from "../src/recommend";
import { Db, Collection } from "mongodb";

// Mock dependencies
jest.mock("../src/index", () => ({
    redis: {
        setEx: jest.fn(),
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

    test("should cache the main product and its recommended products", async () => {
        const productId = 1;
        const mainProduct = { product_id: productId, name: "Main Product" };
        const recommendedProducts = [
            { product_id: 2, name: "Recommended Product 1" },
            { product_id: 3, name: "Recommended Product 2" },
        ];

        (mockCollection.findOne as jest.Mock).mockResolvedValueOnce(mainProduct);
        (recommend_from_product as jest.Mock).mockResolvedValueOnce(recommendedProducts);
        (mockCollection.findOne as jest.Mock).mockResolvedValueOnce(recommendedProducts[0]);
        (mockCollection.findOne as jest.Mock).mockResolvedValueOnce(recommendedProducts[1]);

        await pullIntoCache(productId, mockMongoDB as Db);

        expect(mockMongoDB.collection).toHaveBeenCalledWith("products");
        expect(mockCollection.findOne).toHaveBeenCalledWith({ product_id: productId });
        expect(redis.setEx).toHaveBeenCalledWith(
            `${productId}`,
            300,
            JSON.stringify(mainProduct)
        );

        for (const recommendedProduct of recommendedProducts) {
            expect(mockCollection.findOne).toHaveBeenCalledWith({
                product_id: recommendedProduct.product_id,
            });
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