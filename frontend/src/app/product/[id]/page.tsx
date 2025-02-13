"use client";

import { ReactElement, useEffect, useState } from "react";
import { getProduct } from "@/app/request";
import { Product, ProductReview } from "../../../../../backend/app/src/interfaces";

/**
 * Creates a layout for the given product id
 * @param props Contains an id for the product the user wishes to see.
 */
export default function ProductLayout({ params }: { params: Promise<{ id: number }> }): ReactElement {
    const [product, setProduct] = useState({
        product_id: 0,
        name: "",
        price: 0.0,
        ratings: [],
        reviews: [],
    } as Product);
    useEffect(() => {
        async function fetch() {
            const id = (await params).id;
            const product = await getProduct(id);
            setProduct(product);
        }
        fetch().then((r) => r);
    }, [params]);
    const avg_rating = product.ratings.reduce((sum, current) => sum + current.rating, 0) / product.ratings.length;
    return (
        <div>
            <h1 className="text-2xl">{product.name}</h1>
            <h3 className="text-sm text-gray-600 bg-">id: {product.product_id}</h3>
            <h4 className="bg-stone-300 w-16 rounded-sm">${product.price.toFixed(2)}</h4>
            <div className="bg-stone-300 px-4 py-2 my-2 rounded-md">
                <h2 className="font-bold">Ratings and Reviews:</h2>
                <h4>User Rating: {avg_rating}/5</h4>
            </div>
            <div className="bg-stone-300">
                <h3 className="font-bold">Reviews:</h3>
                {product.reviews.map((review, i) => (
                    <Review key={i} review={review} />
                ))}
            </div>
        </div>
    );
}

/**
 * Helper function which creates cards for each review.
 * @param props Contains the product in which the reviews are located
 * @returns An array of review cards.
 */
function Review({ review }: { review: ProductReview }): ReactElement {
    return (
        <div>
            <h4>{review.username}</h4>
            <p>{review.review}</p>
        </div>
    );
}
