/**
 * This module is responsible for making API requests.
 * 
 * @Author Preston Knepper
 * @Version 12/4/2024
 */

// needed imports
import {Product, User, TransactionRecord} from "../../../backend/app/src/interfaces";

const backendAddress = "http://localhost:8000/api/"
const frontendAddress = "http://localhost:3000/"
const GETHeaders = new Headers();
GETHeaders.append("Access-Control-Allow-Origin", "*");
GETHeaders.append("Origin", frontendAddress);
GETHeaders.append("Access-Control-Request-Method", "GET");
const POSTHeaders = new Headers();
POSTHeaders.append("Origin", frontendAddress);
POSTHeaders.append("Access-Control-Request-Method", "POST");
POSTHeaders.append("Content-Type", "application/json");

/**
 * Get the list of all products.
 * 
 * @returns  All products.
 */
export async function getProducts(): Promise<Product[]> {
    const request: RequestInfo = new Request(backendAddress + 'products/all', {
        method: 'GET',
        headers: GETHeaders,
    });
    return fetch(request)
        .then(response => response.json())
        .then(response => response as Product[]);
}

/**
 * Get a specific product.
 * 
 * @param productId The unique id of the product.
 * @returns The product.
 */
export async function getProduct(productId: number): Promise<Product> {
    console.log(productId);
    const request: RequestInfo = new Request(`http://localhost:8000/api/product/${productId}`, {
        method: 'GET',
        headers: GETHeaders,
    });
    return fetch(request)
        .then(response => response.json())
        .catch(error => {
            console.error(error.toString());
            return {
                product_id: -1,
                name: "failed to load product from database",
                price: 0.0,
                ratings: [],
                reviews: []
            };
        })
        .then(response => response as Product)
        .catch(error => {
            console.error(error.toString());
            return {
                product_id: -1,
                name: "failed to load product from json",
                price: 0.0,
                ratings: [],
                reviews: []
            };
        });

}

/**
 * Get a specified user.
 * 
 * @param username The unique username of the user.
 * @returns The user.
 */
export async function getUser(username: string): Promise<User> {
    const request: RequestInfo = new Request(backendAddress + `user/${username}`, {
        method: 'GET',
        headers: GETHeaders,
    });
    return fetch(request)
        .then(response => response.json())
        .then(response => response as User);
}

/**
 * Get the list of recommendations.
 * 
 * @param productId The product id of which the recommendations come from.
 * @returns The list of recommendations.
 */
export async function getRecommendations(productId: number): Promise<Partial<Product>[]> {
    const request: RequestInfo = new Request(backendAddress + `recommendation/${productId}`, {
        method: 'GET',
        headers: GETHeaders,
    });
    return fetch(request)
        .then(response => response.json())
        .then(response => response as Partial<Product>[]);
}

/**
 * Post a new product.
 * 
 * @param product The product we want to post.
 * @returns An error if something goes wrong.
 */
export async function postProduct(product: Product): Promise<string> {
    const request: RequestInfo = new Request(backendAddress + 'product/', {
        method: 'POST',
        headers: POSTHeaders,
        body: JSON.stringify(product)
    });
    return fetch(request)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.statusText; // Parse the response as JSON
        });
}

/**
 * Post a new user.
 * 
 * @param user The user we want to post.
 * @returns An error if something goes wrong.
 */
export async function postUser(user: User): Promise<string> {
    const request: RequestInfo = new Request(backendAddress + 'user/', {
        method: 'POST',
        headers: POSTHeaders,
        body: JSON.stringify(user)
    });
    return fetch(request)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.statusText; // Parse the response as JSON
        });
}

/**
 * Post a new transaction.
 * 
 * @param transaction The new transaction we want to post.
 * @returns An error if something goes wrong.
 */
export async function postTransaction(transaction: TransactionRecord): Promise<string> {
    const request: RequestInfo = new Request(backendAddress + 'transaction/', {
        method: 'POST',
        headers: POSTHeaders,
        body: JSON.stringify(transaction)
    });
    return fetch(request)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.statusText; // Parse the response as JSON
        });
}

/**
 * Post a new rating.
 * 
 * @param rating The new rating we want to post.
 * @returns An error if something goes wrong.
 */
export async function postRating(
    rating: {username: string, productId: number, rating: number}
): Promise<string> {
    const request: RequestInfo = new Request(backendAddress + 'rating/', {
        method: 'POST',
        headers: POSTHeaders,
        body: JSON.stringify(rating)
    });
    return fetch(request)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.statusText; // Parse the response as JSON
        });
}

/**
 * Post a new review.
 * 
 * @param rating The new review we want to post.
 * @returns An error if something goes wrong.
 */
export async function postReview(
    rating: {username: string, productId: number, review: number}
): Promise<string> {
    const request: RequestInfo = new Request(backendAddress + 'review/', {
        method: 'POST',
        headers: POSTHeaders,
        body: JSON.stringify(rating)
    });
    return fetch(request)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.statusText; // Parse the response as JSON
        });
}

/**
 * Put a new product.
 * 
 * @param product The new product we want to put.
 * @returns An error if something goes wrong.
 */
export async function putProduct(product: Partial<Product> & Pick<Product, "product_id"> ) {
    const request: RequestInfo = new Request(backendAddress + `product/${product.product_id}`, {
        method: 'PUT',
        headers: POSTHeaders,
        body: JSON.stringify(product)
    });
    return fetch(request)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.statusText; // Parse the response as JSON
        });
}

/**
 * Put a new user.
 * 
 * @param user The new user we want to put.
 * @returns An error if something goes wrong.
 */
export async function putUser(user: Partial<User> & Pick<User, "username"> ) {
    const request: RequestInfo = new Request(backendAddress + `user/${user.username}`, {
        method: 'PUT',
        headers: POSTHeaders,
        body: JSON.stringify(user)
    });
    return fetch(request)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.statusText; // Parse the response as JSON
        });
}
