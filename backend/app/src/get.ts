/**
 * This module is used to get the information from mongoDB.
 *
 * @author Dalton Rogers and Preston Knepper
 * @version 11/12/2024
 */

// import the required modules and libraries
import { Db } from 'mongodb';
import { db, neoDriver } from './index';
import { getMongoAddress, mongoConnections } from "./shard";
import { redis } from "./index"
import { Product, ProductObject } from "./interfaces";
import { pullIntoCache } from "./cache";

/**
 * Find and return a user based on a provided username.
 *
 * @param un The username that we are searching for.
 * @param mongodb The mongoDB that we are looking in.
 * @returns A promise, either resolves the query result or rejects.
 */
export async function getUser(un: string) {
    try {
        const address = await getMongoAddress("u" + un);
        const mongodb: Db = await (mongoConnections.get(address!)!)!;
        const user = await mongodb.collection("users").findOne({ username: un });

        if (!user) {
          throw new Error("User not found");
        }

        return user;
    } catch (error) {
        console.log("The user does not exist.");
        return new Promise((_, reject) => reject());
    }
}

/**
 * Find and return a product based on a provided product id.
 *
 * @param pi The product id that we are searching for.
 * @param mongodb The mongoDB that we are looking in.
 * @returns A promise, either resolves the query result or rejects.
 */
export async function getProduct(pi: number) {
    try {
        let product = await redis.get("" + pi);
        if (product) {
            return JSON.parse(product);
        }
        const address = (await getMongoAddress("p" + pi))!;
        const mongodb: Db = (await mongoConnections.get(address))!;
        pullIntoCache(pi, mongodb);
        return await mongodb.collection("products")
          .findOne({ product_id: pi }) as ProductObject as Product;
    } catch (error) {
        console.log("The product does not exist.");
        return new Promise((_, reject) => reject());
    }
}

/**
 * Find and return products based on a provided product name.
 * 
 * @param name The name of the product we are looking for.
 * @param mongodb The mongoDB that we are looking in.
 * @returns A promise, either resolves the query result or rejects.
 */
export async function getProductByName(name: string) {
  try {
    const regex = new RegExp(name, 'i'); // case-insensitive regex
    const products: Product[] = [];
    for (let [_, mongodb] of mongoConnections) {
      const res = await mongodb.collection('products').find({ name: regex }).toArray()
      products.concat(res as ProductObject[]);
    }
    return products
  } catch (error) {
    console.log('The product does not exist.');
    return new Promise((_, reject) => reject());
  }
}

/**
 * Find and return a transaction based on a provided transaction id.
 *
 * @param ti The transaction id that we are searching for.
 * @returns A promise, either resolves the query result or rejects.
 */
export async function getTransaction(ti: number) {
  try {
    let q = `SELECT * FROM TRANSACTIONS WHERE transaction_id = $1;`;
    return await db.query(q, [ti]);
  } catch (error) {
    console.log('The transaction does not exist.');
    return new Promise((_, reject) => reject());
  }
}

/**
 * Returns the first n products in the database.
 *
 *
 * @param n The number of products to get.
 * @param mongodb The mongo database to query.
 * @param mongodb The mongo database to query.
 */
export async function getProducts(n: number) {
  try {
    const mongodb: Db = mongoConnections.get("pknepps.net")!;
    return mongodb?.collection('products').find({}).limit(n).toArray();
  } catch (e) {
    console.log(`There was a problem querying products from MongoDB, ${e}`);
    return new Promise((_, reject) => reject());
  }
}

/**
 * Returns the count of documents in the products collection.
 *
 * @param mongodb The mongo database to query
 * @returns The count of documents in the products collection.
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    let res: Product[] = [];
    for (let [_, mongodb] of mongoConnections) {
      const products = await mongodb.collection('products').find({}).toArray() as ProductObject[]
      res = res.concat(products);
    }
    return res;
  } catch (e) {
    console.log(`There was a problem querying products from MongoDB, ${e}`);
    return new Promise((_, reject) => reject());
  }
}

/**
 * Get information from the products table in the PostgreSQL database.
 *
 * @param pid A potential product id to filter by.
 * @returns A promise that resolves the query result or rejects.
 */
export async function getPostgresData(pid?: number) {
    try {
        if (pid) {
            let q = `
                SELECT 
                    p.product_id as productid,
                    p.name as name,
                    p.price as price,
                    COALESCE(json_agg(
                        json_build_object(
                            'transaction_id', t.transaction_id,
                            'username', t.username
                        )
                    ) FILTER (WHERE t.transaction_id IS NOT NULL), '[]') as transactions
                FROM products p LEFT JOIN transactions t ON p.product_id = t.product_id
                WHERE p.product_id = $1
                GROUP BY p.product_id, p.name, p.price
                ORDER BY p.product_id;`;
                const result = await db.query(q, [pid]);
        return result.rows.map(row => ({
            ProductID: row.productid,
            Name: row.name,
            Price: row.price,
            Transactions: row.transactions
        }));
        } else {
            let q = `
                SELECT 
                    p.product_id as productid,
                    p.name as name,
                    p.price as price,
                    COALESCE(json_agg(
                        json_build_object(
                            'transaction_id', t.transaction_id,
                            'username', t.username
                        )
                    ) FILTER (WHERE t.transaction_id IS NOT NULL), '[]') as transactions
                FROM products p LEFT JOIN transactions t ON p.product_id = t.product_id
                GROUP BY p.product_id, p.name, p.price
                ORDER BY p.product_id;`;
                const result = await db.query(q);
            return result.rows.map(row => ({
                ProductID: row.productid,
                Name: row.name,
                Price: row.price,
                Transactions: row.transactions
            }));
        }
        
    } catch (e) {
        console.log(`There was a problem querying products from PostgreSQL, ${e}`)
        throw e;
    }
}

/**
 * Returns the result of the neo4j query for a specidic product.
 *
 * @param pid The product number we are looking at.
 * @returns The product and its connected nodes.
 */
export async function getNeoGraph(pid?: number) {
  const session = neoDriver.session();
  try {
    //
    // This is ideal but having trouble getting it to work. Going to get the basic
    // working first
    //
    // const result = await session.run(
    //     "MATCH (n {product_id: $pid})-[r:BOUGHT*1..2]-(related) RETURN n, r, related",
    //     { pid }
    // );

    let result;
    if (pid !== undefined) {
      result = await session.run(
        'MATCH (n {product_id: $pid})-[r]-(p) RETURN n, r, p',
        { pid }
      );
    } else {
      result = await session.run('MATCH (n)-[r]-(p) RETURN n, r, p');
    }

    const nodes: { id: number; label: string; type: string }[] = [];
    const edges: { from: number; to: number; label: string }[] = [];
    const nodeSet = new Set<number>();

    result.records.forEach((record) => {
      const n = record.get('n');
      const p = record.get('p');
      const r = record.get('r');

      if (!nodeSet.has(n.identity.low)) {
        const label = n.labels.includes('Product')
          ? n.properties.name
          : n.properties.username;
        nodes.push({ id: n.identity.low, label, type: n.labels[0] });
        nodeSet.add(n.identity.low);
      }

      if (!nodeSet.has(p.identity.low)) {
        const label = p.labels.includes('Product')
          ? p.properties.name
          : p.properties.username;
        nodes.push({ id: p.identity.low, label, type: p.labels[0] });
        nodeSet.add(p.identity.low);
      }

      edges.push({
        from: n.identity.low,
        to: p.identity.low,
        label: r.type,
      });

    });

    return { nodes, edges };
  } catch (e) {
    console.log(`There was a problem querying the Neo4j graph, ${e}`);
    return new Promise((_, reject) => reject());
  }
}

/**
 * Returns the cached data of Redis, the cumulative ids and the address of the shard for the 
 * given product.
 *
 * @param pid The product number we are looking at.
 * @returns The product and its connected nodes.
 */
export async function getRedisData(pid?: number): Promise<any> {
    try {
        const cachedKeys: string[] = await redis.keys("[0-9]*");
        const cachedData: [string, string][] = await Promise.all(cachedKeys.map(async (key): Promise<[string, string]> => {
            const value = await redis.get(key);
            return [key, value];
        }));
        let shard = pid ? ["p" + pid, await getMongoAddress("p" + pid)] : null;
        return {
          cachedData,
          shard
        }
    } catch (e) {
        console.error("There was an issue querying Redis Data: ", e);
        throw e;
    }
}
