"use client";
/**
 * This is a client component that allows the user to create a new product.
 * It includes a form with fields for the product name and price.
 * 
 * @author Dalton Rogers
 * @version 4/3/25
 */

import { useState } from "react";
import { createProduct } from "@/app/request";
import { Card } from '@/app/components';
import "@/app/globals.css";

/**
 * Allows a user to create a new product.
 * 
 * @returns A form that allows the user to create a new product.
 */
export default function CreateProductPage() {
    const [productName, setProductName] = useState("");
    const [productPrice, setProductPrice] = useState("");
    const [message, setMessage] = useState("");

    // handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
        <Card>
            <div className="page-header2">
                <h1 className="page-title2">Product</h1>
                <p className="page-subtitle2">Enter product details below:</p>
            </div>
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
        </Card>
    );
}