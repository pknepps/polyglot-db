/**
 * This module holds all the interfaces that have been defined for this
 * project. This includes user records, product records, transactions records,
 * users, and products.
 *
 * @author Preston Knepper and Dalton Rogers
 * @version 10/28/2024
 */

/**
 * An interface to model a User Record.
 */
export interface UserRecord {
    username: string;
    firstName: string;
    lastName: string;
}

/**
 * An interface to model a Product Record.
 */
export interface ProductRecord {
    productId: number;
    name: string;
    price: number;
}

/**
 * An interface to model a Transaction Record.
 */
export interface TransactionRecord {
    transactionId: number;
    username: string;
    productId: number;
    cardNum: number;
    address: string;
    city: string;
    state: string;
    zip: number;
}

/**
 * An interface to represent the current User objects.
 */
export interface User {
    username: string;
    firstName: string;
    lastName: string;
    middleName: string;
    addresses: { address: string; city: string; state: string; zip: number }[];
    payments: { cardnum: number }[];
    transactions: number[];
    ratings: ProductRating[];
    reviews: ProductReview[];
}

/**
 * An interface to represent the current Product objects.
 */
export interface Product {
    product_id: number;
    name: string;
    price: number;
    ratings: ProductRating[];
    reviews: ProductReview[];
}

export interface ProductRating {
    username: string;
    rating: number;
}

export interface ProductReview {
    username: string;
    review: string;
}
