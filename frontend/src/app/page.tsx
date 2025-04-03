"use client";

// needed imports
import "./page.module.css";
import { ReactElement, useEffect, useState, useContext } from "react";
import { getProducts } from "./request";
import { Product } from "../../../backend/app/src/interfaces";
import Link from "next/link";
import { ProductView } from "./components";
import { SearchContext } from "./searchContext";

/**
 * Used to display all products in the database.
 * 
 * @returns The component that displays all products.
 */
export default function AllProducts(): ReactElement {
    const searchContext = useContext(SearchContext);

    if (!searchContext) {
        throw new Error("SearchContext is not provided. Make sure to wrap the component with SearchContext.Provider.");
    }

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
            <ul>
                {filteredProducts.map((product) => (
                    <Link href={`product/${product.product_id}`} key={product.product_id}>
                        <ProductView productDetails={product} style="preview" recommendations={[]} />
                    </Link>
                ))}
            </ul>
        </>
    );
}