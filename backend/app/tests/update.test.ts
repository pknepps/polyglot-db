import { updateUser, updateProduct, addReview, addRating } from "../src/update";
import { mongoConnections, getMongoAddress } from "../src/shard";

jest.mock("../src/shard", () => ({
    mongoConnections: {
        get: jest.fn(),
    },
    getMongoAddress: jest.fn(),
}));

describe("update.ts", () => {
    let mockDb: any;

    beforeEach(() => {
        mockDb = {
            collection: jest.fn().mockReturnThis(),
            updateOne: jest.fn(),
        };
        (mongoConnections.get as jest.Mock).mockReturnValue(mockDb);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

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

        test("should handle errors when updating user", async () => {
            mockDb.updateOne.mockRejectedValueOnce(new Error("Update failed"));
            (getMongoAddress as jest.Mock).mockResolvedValueOnce("mockAddress");

            await updateUser({ username: "testUser" });

            expect(mockDb.updateOne).toHaveBeenCalled();
        });
    });

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
    });

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
    });
});