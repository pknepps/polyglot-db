"use client";

import { ReactElement, useEffect, useState } from "react";
import { getProduct, getRecommendations } from "@/app/request";
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
    const [recommendations, setRecommendations] = useState<Partial<Product>[]>([]);

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

    useEffect(() => {
        async function fetchRecommendations() {
            try {
                const recommendations = await getRecommendations(product_id);
                setRecommendations(recommendations);
            } catch (error) {
                console.error("Error fetching recommended product:", error);
            }
        }
        fetchRecommendations()
    }, [product_id]);
    // get the average rating of the product
    const avg_rating = productDetails
        ? productDetails.ratings.reduce((sum, current) => sum + current.rating, 0) / productDetails.ratings.length
        : null;
    const avg_rating_str = avg_rating?.toFixed(2)

    // nicely format the product details
    return productDetails ? (
        <div>
            <Card>
                <h1 className="text-4xl font-thinbold">{productDetails.name}</h1>
                <span className="text-sm text-gray-600 mt-16">id: {productDetails.product_id}</span>
                <div className="flex flex-wrap">
                    {recommendations.map((product, i) => (
                        <Card key={i}>
                            <PartialProduct product={product}/>
                        </Card>
                    ))}
                </div>
                <div className="bg-slate-300 w-20 rounded-md font-bold text-xl">${productDetails.price.toFixed(2)}</div>
                <Card>
                    <h2 className="font-bold">Ratings and Reviews:</h2>
                    <h4>User Rating: {avg_rating_str}/5</h4>
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

/**
 * Helper function which creates cards for each recommended product.
 * @param props Contains the product.
 * @returns A product card.
 */
export function PartialProduct({ product }: {product: Partial<Product> }): ReactElement {
    return (
        <a href={`${product.product_id}`}>
            <div>
                <h4 className="font-semibold">{product.name}</h4>
                <span className="text-sm text-gray-600 mt-16">id: {product.product_id}</span>
                <p className="bg-slate-300 w-12 rounded-md font-bold text-xl">${product.price!.toFixed(2)}</p>
            </div>
        </a>
    );
}