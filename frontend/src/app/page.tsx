"use client";

import "./page.module.css";
import { ReactElement, useEffect, useState } from "react";
import { getProducts } from "./request";
import { Product } from "../../../backend/app/src/interfaces";
import Link from "next/link";
import { ProductView } from "./components";

export default function AllProducts({ searchQuery }: { searchQuery: string }): ReactElement {
    // keeps track of the products
    const [products, setProducts] = useState<Product[]>([]);
    // filter the products based on the search query
    const filteredProducts = searchQuery
        ? products.filter(
              (product) =>
                  product.product_id.toString() === searchQuery ||
                  product.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : products;

    // get the products
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
            <h3 className="text-black text-4xl font-bold text-center mb-8">Products</h3>
            <ul className="left-side-list">
                {filteredProducts.length === 0 ? (
                    <li className="text-black">No Products Found. Try another search!</li>
                ) : (
                    filteredProducts.map((product) => (
                        <Link href={`product/${product.product_id}`} key={product.product_id}>
                            <ProductView productDetails={product} style="preview" recommendations={[]}></ProductView>
                        </Link>
                    ))
                )}
            </ul>
        </>
    );
}
