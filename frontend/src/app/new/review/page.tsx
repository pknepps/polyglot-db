"use client";
import React, { useState, useContext } from 'react';
import { Card } from '@/app/components';
import { checkProductExists, checkUsernameAvailability, postReview, postRating } from '@/app/request';
import { CurrentSelectionContext } from '@/app/context';
import "@/app/globals.css";

export default function ReviewPage() {
  const currentSelectionContext = useContext(CurrentSelectionContext);
      if (!currentSelectionContext) {
          throw new Error("SearchContext is not provided. Make sure to wrap the component with SearchContext.Provider.");
      }
  const {currentUsername, currentProductId}  = currentSelectionContext
  const [username, setUsername] = useState(currentUsername);
  const [productId, setProductId] = useState(currentProductId);
  const [review, setReview] = useState('');
  const [rating, setRating] = useState('');
  const [message, setMessage] = useState('');
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [isProductValid, setIsProductValid] = useState(false);

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

    const reviewFormData = { 
      username, 
      product_id: Number(productId),
      review,
    }

    const ratingFormData = { 
      username, 
      product_id: Number(productId),
      rating: Number(rating),
    }

    try {
      const response = await postReview(reviewFormData);
      console.log(response);
    } catch (error) {
      console.error('Error submitting review:', error);
      setMessage('An error occurred. Please try again.');
    }
    try {
      const response = await postRating(ratingFormData);
      console.log(response);
    } catch (error) {
      console.error('Error submitting rating:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <Card>
      <div className="page-header2">
        <h1 className="page-title2">Rating/Review</h1>
        <p className="page-subtitle2">Enter review details below:</p>
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
          <label htmlFor="rating" className="block text-lg font-medium text-gray-700">
            Rating
          </label>
          <input
            type="number"
            id="rating"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="mt-2 block w-full rounded-lg border-gray-200 bg-gray-50 shadow-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg"
            placeholder="Enter your rating out of 5"
            required
          />
        </div>
        <div>
          <label htmlFor="review" className="block text-lg font-medium text-gray-700">
            Review
          </label>
          <input
            type="text"
            id="review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="mt-2 block w-full rounded-lg border-gray-200 bg-gray-50 shadow-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg"
            placeholder="Enter your review"
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