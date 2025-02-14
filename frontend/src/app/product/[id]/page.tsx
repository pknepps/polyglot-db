"use client";

import { ReactElement, useEffect, useState } from "react";
import { getProduct } from "@/app/request";
import { Product, ProductReview } from "../../../../../backend/app/src/interfaces";
import { Card } from "@/app/components";

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

    const avg_rating = product
        ? product.ratings.reduce((sum, current) => sum + current.rating, 0) / product.ratings.length
        : null;
    return product ? (
        <div>
            <h1 className="text-4xl font-thinbold">{product.name}</h1>
            <span className="text-sm text-gray-600 ml-4 mt-16">id: {product.product_id}</span>

            <div className="bg-slate-300 w-20 rounded-md font-bold text-xl">${product.price.toFixed(2)}</div>
            <Card>
                <h2 className="font-bold">Ratings and Reviews:</h2>
                <h4>User Rating: {avg_rating}/5</h4>
            </Card>
            <Card>
                <h3 className="font-bold">Reviews:</h3>
                {product.reviews.map((review, i) => (
                    <Card key={i}>
                        <Review review={review} />
                    </Card>
                ))}
                {product.reviews.length === 0 && "No reviews"}
            </Card>
        </div>
    ) : (
        <div>User does not exist.</div>
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
            <h4 className="font-semibold">{review.username}</h4>
            <p className="m-1">{review.review}</p>
        </div>
    );
}
