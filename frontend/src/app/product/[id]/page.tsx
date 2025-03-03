"use client";

import { ReactElement, useEffect, useState } from "react";
import { getProduct } from "@/app/request";
import { Product, ProductReview } from "../../../../../backend/app/src/interfaces";
import { Card } from "@/app/components";

/**
 * Interface for the ProductLayout component. product_id is the id of the product the 
 * user wishes to see.
 */
interface ProductLayoutProps {
    product_id: number;
}

/**
 * Creates a layout for the given product id
 * @param product_id An id for the product the user wishes to see.
 */
export default function ProductLayout({ product_id }: ProductLayoutProps): ReactElement {
    // holds the product details
    const [productDetails, setProductDetails] = useState<Product | null>(null);

    // get the product details when the product_id changes
    useEffect(() => {
        async function fetchProductDetails() {
            try {
                const productData = await getProduct(product_id);
                setProductDetails(productData);
            } catch (error) {
                console.error("Error fetching product details:", error);
            }
        }
        fetchProductDetails();
    }, [product_id]);

    // get the average rating of the product
    const avg_rating = productDetails
        ? productDetails.ratings.reduce((sum, current) => sum + current.rating, 0) / productDetails.ratings.length
        : null;

    // nicely format the product details
    return productDetails ? (
        <div>
            <Card>
                <h1 className="text-4xl font-thinbold">{productDetails.name}</h1>
                <span className="text-sm text-gray-600 ml-4 mt-16">id: {productDetails.product_id}</span>

                <div className="bg-slate-300 w-20 rounded-md font-bold text-xl">${productDetails.price.toFixed(2)}</div>
                <Card>
                    <h2 className="font-bold">Ratings and Reviews:</h2>
                    <h4>User Rating: {avg_rating}/5</h4>
                </Card>
                <Card>
                    <h3 className="font-bold">Reviews:</h3>
                    {productDetails.reviews.map((review, i) => (
                        <Card key={i}>
                            <Review review={review} />
                        </Card>
                    ))}
                    {productDetails.reviews.length === 0 && "No reviews"}
                </Card>
            </Card>
        </div>
    ) : (
        <div>Loading...</div>
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
