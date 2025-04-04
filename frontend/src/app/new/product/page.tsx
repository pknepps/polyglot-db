"use client";
import { useState } from "react";
import { createProduct } from "@/app/request";

export default function CreateProductPage() {
    const [productName, setProductName] = useState("");
    const [productPrice, setProductPrice] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // create the product object
        const productData = {
            name: productName,
            price: parseFloat(productPrice),
        };

        try {
            const response = await createProduct(productData);
            setMessage("Product created successfully!");
            setProductName("");
            setProductPrice("");
        } catch (error) {
            setMessage("An error occurred. Please try again.");
        }
    };

    return (
        <div className="page-container2">
            <h1 className="page-title2">Create Product</h1>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="productName" className="block text-lg font-medium text-gray-700">
                        Product Name
                    </label>
                    <input
                        type="text"
                        id="productName"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="mt-2 block w-full rounded-lg border-gray-200 bg-gray-50 shadow-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg"
                        placeholder="Enter product name"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="productPrice" className="block text-lg font-medium text-gray-700">
                        Product Price
                    </label>
                    <input
                        type="number"
                        id="productPrice"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        className="mt-2 block w-full rounded-md border-gray-200 bg-gray-50 shadow-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg"
                        placeholder="Enter product price"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="btn2 btn2-blue"
                >
                    Submit
                </button>
            </form>
            {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
        </div>
    );
}