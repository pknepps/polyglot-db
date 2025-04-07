"use client";
import React, { useState } from 'react';
import { Card } from '@/app/components';
import { checkProductExists, checkUsernameAvailability } from '@/app/request';
import "@/app/globals.css";

const TransactionPage = () => {
  const [username, setUsername] = useState('');
  const [productId, setProductId] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [message, setMessage] = useState('');
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [isProductValid, setIsProductValid] = useState(true);

  // Validate username
  const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);

    if (value.trim() === '') {
      setIsUsernameValid(true);
      setMessage('');
      return;
    }

    try {
      const exists = await checkUsernameAvailability(value);
      setIsUsernameValid(exists);
      setMessage(exists ? '' : 'Username does not exist.');
    } catch (error) {
      console.error('Error checking username:', error);
      setMessage('Error validating username.');
    }
  };

  // Validate productId
  const handleProductIdChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProductId(value);

    if (value.trim() === '') {
      setIsProductValid(true);
      setMessage('');
      return;
    }

    try {
      const exists = await checkProductExists(Number(value));
      setIsProductValid(exists);
      setMessage(exists ? '' : 'Product ID does not exist.');
    } catch (error) {
      console.error('Error checking product ID:', error);
      setMessage('Error validating product ID.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isUsernameValid) {
      setMessage('Please enter a valid username.');
      return;
    }

    if (!isProductValid) {
      setMessage('Please enter a valid product ID.');
      return;
    }

    const formData = { username, productId, cardNum, address, city, state, zip };

    console.log(formData);

    try {
      const response = await fetch('/transaction/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          productId: Number(productId),
          cardNum: Number(cardNum),
          zip: Number(zip),
        }),
      });

      if (response.ok) {
        setMessage('Transaction submitted successfully!');
        setUsername("");
        setProductId("");
        setCardNum("");
        setAddress("");
        setCity("");
        setState("");
        setZip("");
      } else {
        setMessage("Failed to submit transaction. Please try again.");
      }
    } catch (error) {
      console.error('Error submitting transaction:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <Card>
      <div className="page-header2">
        <h1 className="page-title2">Transaction</h1>
        <p className="page-subtitle2">Enter transaction details below:</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username" className="block text-lg font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={handleUsernameChange}
            className={`mt-2 block w-full rounded-lg border-gray-200 bg-gray-50 shadow-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg ${
              isUsernameValid ? '' : 'border-red-500'
            }`}
            placeholder="Enter username"
            required
          />
        </div>
        <div>
          <label htmlFor="productId" className="block text-lg font-medium text-gray-700">
            Product ID
          </label>
          <input
            type="number"
            id="productId"
            value={productId}
            onChange={handleProductIdChange}
            className={`mt-2 block w-full rounded-lg border-gray-200 bg-gray-50 shadow-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg ${
              isProductValid ? '' : 'border-red-500'
            }`}
            placeholder="Enter product ID"
            required
          />
        </div>
        <div>
          <label htmlFor="cardNum" className="block text-lg font-medium text-gray-700">
            Card Number
          </label>
          <input
            type="number"
            id="cardNum"
            value={cardNum}
            onChange={(e) => setCardNum(e.target.value)}
            className="mt-2 block w-full rounded-lg border-gray-200 bg-gray-50 shadow-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg"
            placeholder="Enter card number"
            required
          />
        </div>
        <div>
          <label htmlFor="address" className="block text-lg font-medium text-gray-700">
            Address
          </label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-2 block w-full rounded-lg border-gray-200 bg-gray-50 shadow-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg"
            placeholder="Enter address"
            required
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-lg font-medium text-gray-700">
            City
          </label>
          <input
            type="text"
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-2 block w-full rounded-lg border-gray-200 bg-gray-50 shadow-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg"
            placeholder="Enter city"
            required
          />
        </div>
        <div>
          <label htmlFor="state" className="block text-lg font-medium text-gray-700">
            State
          </label>
          <input
            type="text"
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="mt-2 block w-full rounded-lg border-gray-200 bg-gray-50 shadow-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg"
            placeholder="Enter state"
            required
          />
        </div>
        <div>
          <label htmlFor="zip" className="block text-lg font-medium text-gray-700">
            ZIP Code
          </label>
          <input
            type="number"
            id="zip"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            className="mt-2 block w-full rounded-lg border-gray-200 bg-gray-50 shadow-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg"
            placeholder="Enter ZIP code"
            required
          />
        </div>
        <button
          type="submit"
          className="btn2 btn2-blue"
          disabled={!isUsernameValid || !isProductValid}
        >
          Submit
        </button>
      </form>
      {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
    </Card>
  );
};

export default TransactionPage;