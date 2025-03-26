"use client";

import { ReactElement, useEffect, useState } from "react";
import { getProduct } from "@/app/request";
import { Product } from "../../../../../backend/app/src/interfaces";
import { ProductView } from "@/app/components";

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
 * @param product_id An id for the product the user wishes to see.
 */
export default function ProductLayout({ params }: ProductLayoutProps): ReactElement {
    // holds the product details
    const [productDetails, setProductDetails] = useState<Product | null>(null);
    // get the product details when the product_id changes
    useEffect(() => {
        async function fetchProductDetails() {
            const productId = Number((await params).id);
            if (isNaN(productId)) {
                setProductDetails(null);
                return;
            }
            try {
                const productData = await getProduct(productId);
                setProductDetails(productData);
            } catch (error) {
                console.error("Error fetching product details:", error);
            }
        }
        fetchProductDetails();
    }, []);

    // nicely format the product details
    return productDetails ? <ProductView productDetails={productDetails} /> : <div>Loading...</div>;
}
