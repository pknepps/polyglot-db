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

export interface PostgresQueryData {
  ProductID: number;
  Name: string;
  Price: number;
  Transactions: { transaction_id: number; username: string }[];
}

export interface Neo4jQueryData {
  nodes: { id: number; label: string; type: string }[];
  edges: { from: number; to: number; label: string }[];
}

export interface RedisQueryData {
    cachedData: [string, any][];
    shard: [string, string] | null;
}

/**
 * Gets the neo4j graph data.
 *
 * @param productId The unique id of the product.
 * @returns The data from the neo4j database.
 */
export async function getNeoGraph(productId?: number): Promise<Neo4jQueryData> {
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
export async function getPostgresData(
  productId?: number
): Promise<PostgresQueryData[]> {
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
    return data;
  } catch (error) {
    console.error('Error fetching PostgreSQL data:', error);
    return [];
  }
}

/**
 * Gets redis data.
 * 
 * Specifically, gets cached data, cumulative id's, and the current shard
 * @param productId The unique id of the product.
 */
export async function getRedisData(productId?: number): Promise<RedisQueryData> {
      const url = productId
    ? `${backendAddress}redis/${productId}`
    : `${backendAddress}redis/`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: GETHeaders,
        });
        if (!response.ok) {
            throw new Error(
                `Failed to fetch Redis data: ${response.statusText}`
            );
        }
        const data = await response.json();
        return data;
    } catch (error) {
      console.error('Error fetching Redis data:', error);
      throw error;
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
    .then((response) => {
      console.log(response); 
      return response.json();
    })
    .then((response) => {
      console.log(response); 
      return response as Product[];
    })
}

/**
 * Search for a product by name or ID.
 *
 * @param input The search input, which can be a product name or ID.
 * @returns The product if found, or null if not found.
 */
export async function searchProduct(input: string): Promise<Product | Product[] | null> {
  try {
    // check if the input is numeric (assume it's an ID if it's numeric)
    if (!isNaN(Number(input))) {
      // fetch product by ID
      const productId = Number(input);
      return await getProduct(productId);
    } else {
      // fetch product by name
      const response = await fetch(`${backendAddress}product/name/${encodeURIComponent(input)}`, {
        method: 'GET',
        headers: GETHeaders,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch product by name: ${response.statusText}`);
      }

      const products = await response.json();
      
      return products as Product[];
    }
  } catch (error) {
    console.error(`Error searching for product with input "${input}":`, error);
    return null;
  }
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
    backendAddress + `recommendations/${productId}`,
    {
      method: 'GET',
      headers: GETHeaders,
    }
  );
  try {
    const response = await fetch(request);
    const json = await response.json();
    return json as Partial<Product>[];
  } catch (error) {
    console.error('Error while fetching recommendation:', error);
    throw error;
  }
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
  product_id: number;
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
  product_id: number;
  review: string;
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

export async function testPromise(): Promise<any> {
  return fetch('http://localhost:8000/api/product/1');
}

/**
 * Used to create a new product.
 * 
 * @param productData The data of the product we want to create.
 * @returns The created product, or an error if something goes wrong.
 */
export async function createProduct(productData: { name: string; price: number }) {
  try {
      const response = await fetch(`${backendAddress}product/`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
      });

      if (!response.ok) {
          throw new Error("Failed to create product");
      }

      const data = await response.json();
      return data;
  } catch (error) {
      console.error("Error creating product:", error);
  }
}

/**
 * Used to create a new user.
 * 
 * @param userData The data of the user we want to create.
 * @returns The created user, or an error if something goes wrong.
 */
export async function createUser(userData: { username: string; first: string; last: string }) {
  try {
      const response = await fetch(`${backendAddress}user/`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
      });

      if (!response.ok) {
          throw new Error("Failed to create user");
      }

      const data = await response.json();
      return data; 
  } catch (error) {
      console.error("Error creating user:", error);
      throw error;
  }
}

/**
 * Check if a username is available.
 * 
 * @param username The username we want to check the availability of.
 * @returns True if the username is available, false if it is not.
 */
export async function checkUsernameAvailability(username: string): Promise<boolean> {
  try {
      const response = await fetch(`${backendAddress}user/${username}`, {
          method: "GET",
          headers: {
              "Content-Type": "application/json",
          },
      });

      if (response.status === 404) {
          return false;
      }

      if (!response.ok) {
          throw new Error("Failed to check username availability");
      }

      return true;
  } catch (error) {
      console.error("Error checking username availability:", error);
      return false; // Ensure a boolean is returned even in case of an error
  }
}

/**
 * Check if a product ID exists.
 * 
 * @param productId The product ID to check.
 * @returns True if the product ID exists, false otherwise.
 */
export async function checkProductExists(productId: number): Promise<boolean> {
  try {
    const response = await fetch(`${backendAddress}product/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      return true; 
    } else if (response.status === 404) {
      return false; 
    } else {
      throw new Error('Failed to check product ID');
    }
  } catch (error) {
    console.error('Error checking product ID:', error);
    throw error;
  }
}

/**
 * Used to create a new transaction.
 * 
 * @param transactionData The data of the transaction we want to create.
 * @returns A success message or throws an error if something goes wrong.
 */
export async function createTransaction(transactionData: {
  username: string;
  productId: Number;
  cardNum: Number;
  address: string;
  city: string;
  state: string;
  zip: Number;
}): Promise<string> {
  try {
    const response = await fetch(`${backendAddress}transaction/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transactionData),
    });

    // if (!response.ok) {
    //   throw new Error("Failed to create transaction");
    // }

    return await response.json();
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
}

/**
 * Generate random users.
 *
 * @param quantity The number of random users to generate.
 * @returns A success message or throws an error if something goes wrong.
 */
export async function generateRandomUsers(quantity: number): Promise<string> {
  try {
    const response = await fetch(`${backendAddress}generate/users`, {
      method: "POST",
      headers: POSTHeaders,
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate random users");
    }

    return await response.text();
  } catch (error) {
    console.error("Error generating random users:", error);
    throw error;
  }
}

/**
 * Generate random products.
 * 
 * @param quantity The number of random products to generate.
 * @returns A success message or throws an error if something goes wrong.
 */
export async function generateRandomProducts(quantity: number): Promise<string> {
  try {
    const response = await fetch(`${backendAddress}generate/products`, {
      method: "POST",
      headers: POSTHeaders,
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate random products");
    }

    return await response.text();
  } catch (error) {
    console.error("Error generating random products:", error);
    throw error;
  }
}

/**
 * Generate random transactions.
 * @param quantity The number of random transactions to generate.
 * @returns A success message or throws an error if something goes wrong.
 */
export async function generateRandomTransactions(quantity: number): Promise<string> {
  try {
    const response = await fetch(`${backendAddress}generate/transactions`, {
      method: "POST",
      headers: POSTHeaders,
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate random transactions");
    }

    return await response.text();
  } catch (error) {
    console.error("Error generating random transactions:", error);
    throw error;
  }
}