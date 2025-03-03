"use client";
import React, { useState, useEffect, useContext } from "react";
import { getProducts } from "@/app/request";
import { Product } from "../../../backend/app/src/interfaces";
import { SearchContext } from "./searchContext";
import ProductLayout from "./product/[id]/page";
import "./left_side.css";

/**
 * Creates the left side component.
 *
 * @param param0
 * @returns
 */
export function LeftSide({ children }: { children: React.ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const { searchQuery } = useContext(SearchContext);

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

    const filteredProducts = searchQuery
        ? products.filter((product) =>
              product.product_id.toString() === searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : products;

    return (
        <div className="left-side-container bg-stone-100 w-full h-screen p-8">
            <h3 className="text-black text-4xl font-bold text-center mb-8">Products</h3>
            <ul className="left-side-list">
                {filteredProducts.length === 0 ? (
                    <li className="text-black">No Products Found. Try another search!</li>
                ) : filteredProducts.length === 1 && searchQuery ? (
                    <li key={filteredProducts[0].product_id} className="text-black">
                        <ProductLayout product_id={filteredProducts[0].product_id} />
                    </li>
                ) : (
                    filteredProducts.map((product) => (
                        <li key={product.product_id} className="text-black">
                            <ProductLayout product_id={product.product_id} />
                        </li>
                    ))
                )}
            </ul>
            {children}
        </div>
    );
}