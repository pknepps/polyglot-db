"use client";

import "./page.module.css";
import { ReactElement, useEffect, useRef, useState } from "react";
import { getMongoSchema, getNeoGraph, getPostgresData, getProducts } from "./request";
import { Product } from "../../../backend/app/src/interfaces";
import Link from "next/link";
import { Card, MongoSchema, NeoGraph, PostgresDataTable, ProductView } from "./components";
import { JsonData, JsonEditor } from "json-edit-react";
import { Network } from "vis-network";
import { LeftSide } from "./left_side_pane";
import { RightSide } from "./right_side_component";

export default function AllProducts({ searchQuery }: { searchQuery: string }): ReactElement {
    // keeps track of the products
    const [products, setProducts] = useState<Product[]>([]);

    // stuff for right side
    const [neoGraphData, setNeoGraphData] = useState<{
        nodes: any[];
        edges: any[];
    }>({ nodes: [], edges: [] });
    const [mongoSchema, setMongoSchema] = useState(null);
    const [postgresData, setPostgresData] = useState<Product[]>([]);
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

    // handles button clicks, each display a different image
    const handleButtonClick = async (dbName: string) => {
        setMongoSchema(null);
        setNeoGraphData({ nodes: [], edges: [] });
        setPostgresData([]);
        switch (dbName) {
            case "PostgreSQL": {
                try {
                    const data = await getPostgresData();
                    setPostgresData(data);
                } catch (error) {
                    console.error("Error fetching postgres data:", error);
                }
                break;
            }
            case "MongoDB": {
                try {
                    const mongoSchema = await getMongoSchema();
                    setMongoSchema(mongoSchema);
                } catch (error) {
                    console.error(`Error occurred while fetching mongodb data: ${error}`);
                }
                break;
            }
            case "Neo4j": {
                try {
                    const data = await getNeoGraph();
                    setNeoGraphData(data);
                } catch (error) {
                    console.error("Error fetching neo4j data:", error);
                }
                break;
            }
            case "Redis": {
                console.log("Redis button has been pressed.");
                break;
            }
        }
    };

    return (
        <div>
            <LeftSide>
                <h3 className="text-black text-4xl font-bold text-center mb-8">Products</h3>
                <ul className="left-side-list">
                    {filteredProducts.length === 0 ? (
                        <li className="text-black">No Products Found. Try another search!</li>
                    ) : (
                        filteredProducts.map((product) => (
                            <Link href={`product/${product.product_id}`} key={product.product_id}>
                                <ProductView
                                    productDetails={product}
                                    style="preview"
                                    recommendations={[]}
                                ></ProductView>
                            </Link>
                        ))
                    )}
                </ul>
            </LeftSide>
            <RightSide handleButtonClick={handleButtonClick}>
                {postgresData.length > 0 && (
                    <PostgresDataTable
                        data={postgresData.map((product) =>
                            Object.fromEntries(Object.entries(product).map(([key, value]) => [key, value ?? null]))
                        )}
                    />
                )}
                {neoGraphData.nodes.length > 0 && <NeoGraph data={neoGraphData} />}
                {mongoSchema && <MongoSchema schema={mongoSchema} />}
            </RightSide>
        </div>
    );
}
