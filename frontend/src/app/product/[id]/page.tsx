"use client";

import { ReactElement, useEffect, useState, useContext } from "react";
import { getProduct, getRecommendations } from "@/app/request";
import { Product } from "../../../../../backend/app/src/interfaces";
import { ProductView } from "@/app/components";
import { CurrentSelectionContext } from "@/app/context";

/**
 * Interface for the ProductLayout component. product_id is the id of the product the
 * user wishes to see.
 */
interface ProductLayoutProps {
    product_id: number;
    params: Promise<{ id: string }>;
}

/**
 * Creates a layout for the given product id
 * @param params Route param that contains an id for the product the user wishes to see.
 */
export default function ProductLayout({ params }: ProductLayoutProps): ReactElement {
    // holds the product details
    const currentSelectionContext = useContext(CurrentSelectionContext);

    if (!currentSelectionContext) {
        throw new Error("context is not provided. Ensure it is wrapped in a provider.");
    }

    const { setCurrentProductId } = currentSelectionContext;
    const [productDetails, setProductDetails] = useState<Product | null>(null);
    const [recommendations, setRecommendations] = useState<Partial<Product>[]>([]);

    // get the product details when the product_id changes
    useEffect(() => {
        async function fetchProductDetails() {
            const productId = Number((await params).id);
            if (isNaN(productId)) {
                setProductDetails(null);
                setCurrentProductId("");
                return;
            }
            try {
                const productData = await getProduct(productId);
                setProductDetails(productData);
                setCurrentProductId("" + productData.product_id);
            } catch (error) {
                console.error("Error fetching product details:", error);
            }
            try {
                const recommendations = await getRecommendations(productId);
                setRecommendations(recommendations);
            } catch (error) {
                console.error("Error fetching recommended product:", error);
            }
        }
        fetchProductDetails();
    }, []);

    // nicely format the product details
    return productDetails ? (
        <ProductView productDetails={productDetails} style="full" recommendations={recommendations} />
    ) : (
        <div>Loading...</div>
    );
}
