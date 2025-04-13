"use client";

import React, { useState } from "react";
import { Card } from "@/app/components";
import "@/app/globals.css";
import {
  generateRandomUsers,
  generateRandomProducts,
  generateRandomTransactions,
} from "@/app/request";

export default function GenerateRandomPage() {
  const [userQuantity, setUserQuantity] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [transactionQuantity, setTransactionQuantity] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Set empty fields to "0"
    const userCount = parseInt(userQuantity.trim() || "0");
    const productCount = parseInt(productQuantity.trim() || "0");
    const transactionCount = parseInt(transactionQuantity.trim() || "0");

    setMessage("Generating data...")

    try {
      if (userCount > 0) {
        await generateRandomUsers(userCount);
      }
      if (productCount > 0) {
        await generateRandomProducts(productCount);
      }
      if (transactionCount > 0) {
        await generateRandomTransactions(transactionCount);
      }

      setMessage(
        `Successfully generated ${userCount} users, ${productCount} products, and ${transactionCount} transactions.`
      );
      setUserQuantity("");
      setProductQuantity("");
      setTransactionQuantity("");
    } catch (error) {
      console.error("Error generating random data:", error);
      setMessage("An error occurred while generating random data. Please try again.");
    }
  };

  return (
    <Card>
      <div className="page-header2">
        <h1 className="page-title2">Generate Random Data</h1>
        <p className="page-subtitle2">Enter the quantities below to generate random data:</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Users Input */}
        <div>
          <label htmlFor="userQuantity" className="block text-lg font-medium text-gray-700">
            Number of Users
          </label>
          <input
            type="number"
            id="userQuantity"
            value={userQuantity}
            onChange={(e) => setUserQuantity(e.target.value)}
            className="mt-2 block w-full rounded-lg border-gray-200 bg-gray-50 shadow-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg"
            placeholder="Enter number of users"
          />
        </div>

        {/* Products Input */}
        <div>
          <label htmlFor="productQuantity" className="block text-lg font-medium text-gray-700">
            Number of Products
          </label>
          <input
            type="number"
            id="productQuantity"
            value={productQuantity}
            onChange={(e) => setProductQuantity(e.target.value)}
            className="mt-2 block w-full rounded-lg border-gray-200 bg-gray-50 shadow-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg"
            placeholder="Enter number of products"
          />
        </div>

        {/* Transactions Input */}
        <div>
          <label htmlFor="transactionQuantity" className="block text-lg font-medium text-gray-700">
            Number of Transactions
          </label>
          <input
            type="number"
            id="transactionQuantity"
            value={transactionQuantity}
            onChange={(e) => setTransactionQuantity(e.target.value)}
            className="mt-2 block w-full rounded-lg border-gray-200 bg-gray-50 shadow-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg"
            placeholder="Enter number of transactions"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn2 btn2-blue"
        >
          Generate
        </button>
      </form>

      {/* Message Display */}
      {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
    </Card>
  );
}