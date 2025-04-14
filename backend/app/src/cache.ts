import { Db } from "mongodb";
import { redis } from "./index";
import { Product, ProductObject } from "./interfaces";
import { recommend_from_product } from "./recommend";

const CACHE_TIME = 45;

/**
 * Copies the product representing the product id from MongoDB into the Redis 
 * cache. Also copies all recommended products of that product into the cache.
 * @param productId The id of the product to cache.
 * @param mongoDB The mongo database the product is located in.
 */
export async function pullIntoCache(productId: number, mongoDB: Db) {
    try {
        console.log(productId);
        const collection = await mongoDB.collection("products");
        const product = await collection.findOne({ product_id: productId });
        await redis.setEx("" + productId, 300, JSON.stringify(product as ProductObject as Product));
        (await recommend_from_product(productId)).forEach(
            async (productPart: Partial<Product> & Pick<Product, "product_id">) => {
                const product: Product = await mongoDB.collection("products")
                    .findOne({ product_id: productPart.product_id }) as ProductObject as Product;
                redis.setEx("" + productPart.product_id, CACHE_TIME, JSON.stringify(product));
        });
    } catch (e) {
        console.error(`An error occured when trying to pull product ${productId} into cache\n${e}`);
    }
}
