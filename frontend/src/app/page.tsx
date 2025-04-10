"use client";

// needed imports
import "./page.module.css";
import { ReactElement, useEffect, useState, useContext } from "react";
import { getProducts } from "./request";
import { Product } from "../../../backend/app/src/interfaces";
import Link from "next/link";
import { ProductView } from "./components";
import { SearchContext, CurrentSelectionContext } from "./context";

/**
 * Used to display all products in the database.
 * 
 * @returns The component that displays all products.
 */
export default function AllProducts(): ReactElement {
    const searchContext = useContext(SearchContext);
    const currentSelectionContext = useContext(CurrentSelectionContext);

    if (!currentSelectionContext || !searchContext) {
        throw new Error("context is not provided. Ensure it is wrapped in a provider.");
    }

    const { setCurrentProductId } = currentSelectionContext;

    const { searchQuery } = searchContext;
    const [products, setProducts] = useState<Product[]>([]);

    const filteredProducts = searchQuery
        ? products.filter(
              (product) =>
                  product.product_id.toString() === searchQuery ||
                  product.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : products;

    useEffect(() => {
        async function fetchProducts() {
            try {
                const products = await getProducts();
                setCurrentProductId("");
                setProducts(products);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        }
        fetchProducts();
    }, []);

    return (
        <>
            <h3 className="products-title">Products</h3>
            {filteredProducts.length > 0 ? (
                <ul>
                    {filteredProducts.map((product) => (
                        <Link href={`product/${product.product_id}`} key={product.product_id}>
                            <ProductView productDetails={product} style="preview" recommendations={[]} />
                        </Link>
                    ))}
                </ul>
            ) : (
                <p>No valid products available.</p>
            )}
        </>
    );
}