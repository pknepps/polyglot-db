import { updateUser, updateProduct, addReview, addRating } from "../src/update";
import { mongoConnections, getMongoAddress } from "../src/shard";

/**
 * Set up Jest to mock the MongoDB connection and address retrieval functions.
 */
jest.mock("../src/shard", () => ({
    mongoConnections: {
        get: jest.fn(),
    },
    getMongoAddress: jest.fn(),
}));

describe("update.ts", () => {
    let mockDb: any;

    /**
     * Initialize the mock database connection before each test.
     */
    beforeEach(() => {
        mockDb = {
            collection: jest.fn().mockReturnThis(),
            updateOne: jest.fn(),
        };
        (mongoConnections.get as jest.Mock).mockReturnValue(mockDb);
    });

    /**
     * Clear all mocks after each test to ensure no state is shared between tests.
     */
    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Test for the updateUser function.
     */
    describe("updateUser function", () => {
        test("should update user properties successfully", async () => {
            mockDb.updateOne.mockResolvedValueOnce({});
            (getMongoAddress as jest.Mock).mockResolvedValueOnce("mockAddress");

            await updateUser({ username: "testUser" });

            expect(getMongoAddress).toHaveBeenCalledWith("utestUser");
            expect(mongoConnections.get).toHaveBeenCalledWith("mockAddress");
            expect(mockDb.updateOne).toHaveBeenCalledWith(
                { username: "testUser" },
                { $set: { username: "testUser" } }
            );
        });

        test("should handle missing username in updateUser", async () => {
            const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
            await updateUser({ username: "" });
            expect(getMongoAddress).not.toHaveBeenCalled();
            expect(mockDb.updateOne).not.toHaveBeenCalled();
            expect(consoleLogSpy).toHaveBeenCalledWith("Invalid username provided:", "");
            consoleLogSpy.mockRestore(); 
        });

        test("should handle errors when updating user", async () => {
            mockDb.updateOne.mockRejectedValueOnce(new Error("Update failed"));
            (getMongoAddress as jest.Mock).mockResolvedValueOnce("mockAddress");

            await updateUser({ username: "testUser" });

            expect(mockDb.updateOne).toHaveBeenCalled();
        });
    });

    /**
     * Test for the updateProduct function.
     */
    describe("updateProduct function", () => {
        test("should update product properties successfully", async () => {
            mockDb.updateOne.mockResolvedValueOnce({});
            (getMongoAddress as jest.Mock).mockResolvedValueOnce("mockAddress");

            await updateProduct({ product_id: 123, name: "Test Product" });

            expect(getMongoAddress).toHaveBeenCalledWith("p123");
            expect(mongoConnections.get).toHaveBeenCalledWith("mockAddress");
            expect(mockDb.updateOne).toHaveBeenCalledWith(
                { product_id: 123 },
                { $set: { product_id: 123, name: "Test Product" } }
            );
        });

        test("should handle errors when updating product", async () => {
            mockDb.updateOne.mockRejectedValueOnce(new Error("Update failed"));
            (getMongoAddress as jest.Mock).mockResolvedValueOnce("mockAddress");

            await updateProduct({ product_id: 123, name: "Test Product" });

            expect(mockDb.updateOne).toHaveBeenCalled();
        });
    });

    /**
     * Test for the addReview function.
     */
    describe("addReview function", () => {
        test("should add a review to user and product successfully", async () => {
            mockDb.updateOne.mockResolvedValue({});
            (getMongoAddress as jest.Mock)
                .mockResolvedValueOnce("userAddress")
                .mockResolvedValueOnce("productAddress");

            await addReview({
                username: "testUser",
                product_id: 123,
                review: "Great product!",
            });

            expect(getMongoAddress).toHaveBeenCalledWith("utestUser");
            expect(getMongoAddress).toHaveBeenCalledWith("p123");
            expect(mockDb.updateOne).toHaveBeenCalledTimes(2);
        });

        test("should handle errors when adding review to user or product", async () => {
            const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
            mockDb.updateOne
                .mockRejectedValueOnce(new Error("User review insert failed"))  // first call
                .mockResolvedValueOnce({});  // second call
            (getMongoAddress as jest.Mock)
                .mockResolvedValueOnce("userAddress")
                .mockResolvedValueOnce("productAddress");
        
            await addReview({
                username: "testUser",
                product_id: 123,
                review: "Awesome!",
            });
        
            expect(consoleLogSpy).toHaveBeenCalledWith(
                "Failed to add review to user: ",
                "testUser",
                "\n",
                expect.any(Error)
            );
            consoleLogSpy.mockRestore();
        });

        test("should log error if adding review to user fails", async () => {
            const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
            mockDb.updateOne
                .mockRejectedValueOnce(new Error("User update failed"))  // user fails
                .mockResolvedValueOnce({});  // product succeeds
        
            (getMongoAddress as jest.Mock)
                .mockResolvedValueOnce("userAddress")
                .mockResolvedValueOnce("productAddress");
        
            await addReview({ username: "testUser", product_id: 123, review: "Nice!" });
        
            expect(consoleLogSpy).toHaveBeenCalledWith(
                "Failed to add review to user: ",
                "testUser",
                "\n",
                expect.any(Error)
            );
        
            consoleLogSpy.mockRestore();
        });
    });

    /**
     * Test for the addRating function.
     */
    describe("addRating function", () => {
        test("should add a rating to user and product successfully", async () => {
            mockDb.updateOne.mockResolvedValue({});
            (getMongoAddress as jest.Mock)
                .mockResolvedValueOnce("userAddress")
                .mockResolvedValueOnce("productAddress");

            await addRating({
                username: "testUser",
                product_id: 123,
                rating: 5,
            });

            expect(getMongoAddress).toHaveBeenCalledWith("utestUser");
            expect(getMongoAddress).toHaveBeenCalledWith("p123");
            expect(mockDb.updateOne).toHaveBeenCalledTimes(2);
        });

        test("should log error if adding rating to user fails", async () => {
            const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
            mockDb.updateOne
                .mockRejectedValueOnce(new Error("User rating failed"))  // user fails
                .mockResolvedValueOnce({});  // product succeeds
        
            (getMongoAddress as jest.Mock)
                .mockResolvedValueOnce("userAddress")
                .mockResolvedValueOnce("productAddress");
        
            await addRating({ username: "testUser", product_id: 456, rating: 4 });
        
            expect(consoleLogSpy).toHaveBeenCalledWith(
                "Failed to add rating to user: ",
                "testUser",
                "\n",
                expect.any(Error)
            );
        
            consoleLogSpy.mockRestore();
        });

        test("should log error if adding rating to product fails", async () => {
            const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
            mockDb.updateOne
                .mockResolvedValueOnce({})  // user succeeds
                .mockRejectedValueOnce(new Error("Product rating failed"));  // product fails
        
            (getMongoAddress as jest.Mock)
                .mockResolvedValueOnce("userAddress")
                .mockResolvedValueOnce("productAddress");
        
            await addRating({ username: "testUser", product_id: 789, rating: 2 });
        
            expect(consoleLogSpy).toHaveBeenCalledWith(
                "Failed to add rating to product: ",
                789,
                "\n",
                expect.any(Error)
            );
        
            consoleLogSpy.mockRestore();
        });
    });
});