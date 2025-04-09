/**
 * This module contains update operations for the polyglot mongo database.
 *
 * @author Preston Knepper
 * @version Oct. 3, 2024
 */

// these are the required imports
import { User, Product } from "./interfaces";
import { getMongoAddress, mongoConnections } from "./shard";
import { pullIntoCache } from "./cache";

/**
 * Updates a property in user.
 *
 * @param props A partial user with only the properties to update and the username.
 * @param db The mongo database in which the user to update is located.
 */
export async function updateUser(props: Partial<User> & Pick<User, "username">) {
    const db = mongoConnections.get((await getMongoAddress("u" + props.username))!);
    // @ts-ignore
    db.collection("users")
        .updateOne({ username: props.username }, { $set: props })
        .then((_) => console.log("Successfully updated user: ", props.username))
        .catch((error) => console.log("Failed to update user: ", props.username, "\n", error));
}

/**
 * Updates a property in product.
 *
 * @param props A partial product with only the properties to update and the product_id.
 * @param db The mongo database in which the product to update is located.
 */
export async function updateProduct(props: Partial<Product> & Pick<Product, "product_id">) {
    const db = mongoConnections.get((await getMongoAddress("p" + props.product_id))!);
    // @ts-ignore
    db.collection("products")
        .updateOne({ product_id: props.product_id }, { $set: props })
        .then((_) => console.log("Successfully updated product: ", props.product_id))
        .catch((error) => console.log("Failed to update product: ", props.product_id, "\n", error));
}

/**
 * Adds a review to the user and product within the given review.
 *
 * @param review The review to add. Includes the username, product, and the string representing the review.
 * @param db The mongo database to update.
 */
export async function addReview(review: { username: string; product_id: number; review: string }) {
    let db = mongoConnections.get((await getMongoAddress("u" + review.username))!)
    const addUserReviews = db!
        .collection("users")
        .updateOne(
            { username: review.username },
            // @ts-ignore
            { $push: { reviews: { product_id: review.product_id, review: review.review } } }
        )
        .then((_) => console.log("Successfully added review to user: ", review.username))
        .catch((error) => console.log("Failed to add review to user: ", review.username, "\n", error));
    const address = (await getMongoAddress("p" + review.product_id))!
    db = mongoConnections.get(address);
    const addProductReviews = db!
        .collection("products")
        .updateOne(
            { product_id: review.product_id },
            // @ts-ignore
            { $push: { reviews: { username: review.username, review: review.review } } }
        )
        .then((_) => console.log("Successfully added review to product: ", review.product_id))
        .catch((error) => console.log("Failed to add review to product: ", review.product_id, "\n", error));
    await Promise.all([addUserReviews, addProductReviews]);
}

/**
 * Adds a rating to the user and product within the given rating.
 *
 * @param rating The rating to add. Includes the username, product, and the number out of 5 representing the rating.
 * @param db The mongo database to update.
 */
export async function addRating(rating: { username: string; product_id: number; rating: number }) {
    let db = mongoConnections.get((await getMongoAddress("u" + rating.username))!)
    const addRatingsToUsers = db!
        .collection("users")
        .updateOne(
            { username: rating.username },
            // @ts-ignore
            { $push: { ratings: { product_id: rating.product_id, rating: rating.rating } } }
        )
        .then((_) => console.log("Successfully added rating to user: ", rating.username))
        .catch((error) => console.log("Failed to add rating to user: ", rating.username, "\n", error));
    db = mongoConnections.get((await getMongoAddress("p" + rating.product_id))!)
    const addRatingsToProducts = db!
        .collection("products")
        .updateOne(
            { product_id: rating.product_id },
            // @ts-ignore
            { $push: { ratings: { username: rating.username, rating: rating.rating } } }
        )
        .then((_) => console.log("Successfully added rating to product: ", rating.product_id))
        .catch((error) => console.log("Failed to add rating to product: ", rating.product_id, "\n", error));
    await Promise.all([addRatingsToUsers, addRatingsToProducts]);
    await pullIntoCache(rating.product_id, db!);
}
