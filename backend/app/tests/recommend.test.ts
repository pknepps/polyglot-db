import { recommend_from_product } from "../src/recommend";
import { neoDriver } from "../src";
import { mocked } from "jest-mock";

jest.mock("../src", () => ({
    neoDriver: {
        executeQuery: jest.fn(),
    },
}));

describe("recommend_from_product", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should return a list of recommended products when query succeeds", async () => {
        const mockRecords = [
            {
                get: jest.fn((key: "p.product_id" | "p.name" | "p.price") => {
                    const data = {
                        "p.product_id": 1,
                        "p.name": "Product A",
                        "p.price": 10.99,
                    };
                    return data[key];
                }),
            },
            {
                get: jest.fn((key: "p.product_id" | "p.name" | "p.price") => {
                    const data = {
                        "p.product_id": 2,
                        "p.name": "Product B",
                        "p.price": 15.99,
                    };
                    return data[key];
                }),
            },
        ];

        mocked(neoDriver.executeQuery).mockResolvedValueOnce({ records: mockRecords });

        const result = await recommend_from_product(123);

        expect(neoDriver.executeQuery).toHaveBeenCalledWith(
            expect.any(String),
            { product_id: 123 },
            { database: "neo4j" }
        );
        expect(result).toEqual([
            { product_id: 1, name: "Product A", price: 10.99 },
            { product_id: 2, name: "Product B", price: 15.99 },
        ]);
    });

    test("should return an empty array when no recommendations are found", async () => {
        mocked(neoDriver.executeQuery).mockResolvedValueOnce({ records: [] });

        const result = await recommend_from_product(123);

        expect(neoDriver.executeQuery).toHaveBeenCalledWith(
            expect.any(String),
            { product_id: 123 },
            { database: "neo4j" }
        );
        expect(result).toEqual([]);
    });

    test("should reject the promise when an error occurs", async () => {
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        mocked(neoDriver.executeQuery).mockRejectedValueOnce(new Error("Query failed"));
    
        await expect(recommend_from_product(123)).rejects.toThrow();
    
        expect(neoDriver.executeQuery).toHaveBeenCalledWith(
            expect.any(String),
            { product_id: 123 },
            { database: "neo4j" }
        );
    
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "neo4j rejected query with error:",
            expect.any(Error)
        );
    
        consoleErrorSpy.mockRestore();
    });
});