/**
 * This module contains functions related to recommending products to users.
 * @author Preston Knepper
 * @version 10/31/24
 */

import { neoDriver, } from ".";
import { Product, } from "./interfaces"

/**
 * Recommends a product based on the given product_id. The recommendations 
 * returned will be the products which have been most frequently bought by 
 * users which also bought the given product. Utilizes Neo4J.
 * @param product_id The id of the product to get recommendations for.
 * @returns A list of at most 5 product_ids of recommended products
 */
export async function recommend_from_product(product_id: number): Promise<
    (Partial<Product> & Pick<Product, "product_id">)[]
> {
    try {
        const { records } = await neoDriver.executeQuery (
            `MATCH (root:Product {product_id: $product_id}) <-[:BOUGHT]- (u:User) -[:BOUGHT]-> (p:Product)
                WHERE p <> root
                WITH p, count(p) AS cnt
                RETURN p.product_id, p.name, p.price, cnt
                ORDER BY cnt DESCENDING
                LIMIT 5`,
            {product_id},
            {database: "neo4j"}
        );
        return records.map((record) => {
            return {
                product_id: record.get('p.product_id'),
                name: record.get('p.name'),
                price: record.get('p.price'), };
        });
    } catch (err) {
        console.log("neo4j rejected query with error:", err)
    }
    return new Promise((_, reject) => reject());
}