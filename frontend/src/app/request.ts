/**
 * This module is responsible for making API requests.
 *
 * @Author Preston Knepper
 * @Version 12/4/2024
 */

// needed imports
import {
  Product,
  User,
  TransactionRecord,
} from '../../../backend/app/src/interfaces';

const backendAddress = 'http://localhost:8000/api/';
const frontendAddress = 'http://localhost:3000/';
const GETHeaders = new Headers();
GETHeaders.append('Access-Control-Allow-Origin', '*');
GETHeaders.append('Origin', frontendAddress);
GETHeaders.append('Access-Control-Request-Method', 'GET');
const POSTHeaders = new Headers();
POSTHeaders.append('Origin', frontendAddress);
POSTHeaders.append('Access-Control-Request-Method', 'POST');
POSTHeaders.append('Content-Type', 'application/json');

/**
 * Gets the neo4j graph data.
 *
 * @param productId The unique id of the product.
 * @returns The data from the neo4j database.
 */
export async function getNeoGraph(
  productId?: number
): Promise<{ nodes: any[]; edges: any[] }> {
  try {
    const url = productId
      ? `${backendAddress}neo/graph/${productId}`
      : `${backendAddress}neo/graph/`;
    const response = await fetch(url, {
      method: 'GET',
      headers: GETHeaders,
    });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch Neo4j graph for product with id ${productId}: ${response.statusText}`
      );
    }
    const data = await response.json();

    // Ensure nodes have labels
    const nodes = data.nodes.map((node: any) => ({
      ...node,
      label: node.label || node.name || `Node ${node.id}`,
    }));

    return { nodes, edges: data.edges };
  } catch (error) {
    console.error(
      `Error fetching Neo4j graph for product with id ${productId}:`,
      error
    );
    return { nodes: [], edges: [] };
  }
}

export async function getMongoSchema() {
    console.log("Mongo button is pressed");
    try {
    const url = `${backendAddress}mongodb/schema`;
    const response = await fetch(url, {
      method: 'GET',
      headers: GETHeaders,
    });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch mongodb graph with error: ${response.statusText}`
      );
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fecthing mongo schema: ${error}`);
    return null;
  }
}

/**
 * Gets the postgres data.
 *
 * @param productId The unique id of the product.
 * @returns The data from the postgres database.
 */
export async function getPostgresData(productId?: number): Promise<any[]> {
    console.log("Postgres button is pressed");
    try {
    const url = productId
      ? `${backendAddress}postgres/${productId}`
      : `${backendAddress}postgres/`;
    const response = await fetch(url, {
      method: 'GET',
      headers: GETHeaders,
    });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch PostgreSQL data: ${response.statusText}`
      );
    }
    const data = await response.json();
    console.log("PostgreSQL Data:", data); // Log the response data
    return data;
  } catch (error) {
    console.error('Error fetching PostgreSQL data:', error);
    return [];
  }
}

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
    .then((response) => response.json())
    .then((response) => response as Product[]);
}

/**
 * Get a specific product.
 *
 * @param productId The unique id of the product.
 * @returns The product.
 */
export async function getProduct(productId: number): Promise<Product> {
  try {
    const response = await fetch(`${backendAddress}product/${productId}`, {
      method: 'GET',
      headers: GETHeaders,
    });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch product with id ${productId}: ${response.statusText}`
      );
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching product with id ${productId}:`, error);
    return {
      product_id: -1,
      name: 'Failed to load product from database',
      price: 0.0,
      ratings: [],
      reviews: [],
    };
  }
}

/**
 * Get a specified user.
 *
 * @param username The unique username of the user.
 * @returns The user.
 */
export async function getUser(username: string): Promise<User> {
  const request: RequestInfo = new Request(
    backendAddress + `user/${username}`,
    {
      method: 'GET',
      headers: GETHeaders,
    }
  );
  return fetch(request)
    .then((response) => response.json())
    .then((response) => response as User);
}

/**
 * Get the list of recommendations.
 *
 * @param productId The product id of which the recommendations come from.
 * @returns The list of recommendations.
 */
export async function getRecommendations(
  productId: number
): Promise<Partial<Product>[]> {
  const request: RequestInfo = new Request(
    backendAddress + `recommendation/${productId}`,
    {
      method: 'GET',
      headers: GETHeaders,
    }
  );
  return fetch(request)
    .then((response) => response.json())
    .then((response) => response as Partial<Product>[]);
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
    body: JSON.stringify(product),
  });
  return fetch(request).then((response) => {
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
    body: JSON.stringify(user),
  });
  return fetch(request).then((response) => {
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
export async function postTransaction(
  transaction: TransactionRecord
): Promise<string> {
  const request: RequestInfo = new Request(backendAddress + 'transaction/', {
    method: 'POST',
    headers: POSTHeaders,
    body: JSON.stringify(transaction),
  });
  return fetch(request).then((response) => {
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
export async function postRating(rating: {
  username: string;
  productId: number;
  rating: number;
}): Promise<string> {
  const request: RequestInfo = new Request(backendAddress + 'rating/', {
    method: 'POST',
    headers: POSTHeaders,
    body: JSON.stringify(rating),
  });
  return fetch(request).then((response) => {
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
export async function postReview(rating: {
  username: string;
  productId: number;
  review: number;
}): Promise<string> {
  const request: RequestInfo = new Request(backendAddress + 'review/', {
    method: 'POST',
    headers: POSTHeaders,
    body: JSON.stringify(rating),
  });
  return fetch(request).then((response) => {
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
export async function putProduct(
  product: Partial<Product> & Pick<Product, 'product_id'>
) {
  const request: RequestInfo = new Request(
    backendAddress + `product/${product.product_id}`,
    {
      method: 'PUT',
      headers: POSTHeaders,
      body: JSON.stringify(product),
    }
  );
  return fetch(request).then((response) => {
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
export async function putUser(user: Partial<User> & Pick<User, 'username'>) {
  const request: RequestInfo = new Request(
    backendAddress + `user/${user.username}`,
    {
      method: 'PUT',
      headers: POSTHeaders,
      body: JSON.stringify(user),
    }
  );
  return fetch(request).then((response) => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.statusText; // Parse the response as JSON
  });
}
