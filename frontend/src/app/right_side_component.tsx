"use client";
/**
 * This module is responsible for creating the right side component.
 *
 * @Author Dalton Rogers
 * @Version 12/4/2024
 */

import React, { useState, useContext, useEffect, useRef } from "react";
import "./right_side_component.css";
import { Product } from "../../../backend/app/src/interfaces";
import { getNeoGraph } from "./request";
import { SearchContext } from "./searchContext";
import ProductLayout from "./product/[id]/page";
import { Network } from "vis-network/standalone/esm/vis-network";

/**
 * Creates the right side component for the UI.
 *
 * @returns The right side component.
 */
export function RightSide() {
    // initialize the use states
    const [message, setMessage] = useState<string>("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [neoGraphData, setNeoGraphData] = useState<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] });
    const { searchQuery } = useContext(SearchContext);

    // handles button clicks, each display a different image
    const handleButtonClick = async (dbName: string) => {
        switch (dbName) {
            case "PostgreSQL": {
                setMessage("PostgreSQL button has been pressed.");
                break;
            }
            case "MongoDB": {
                setMessage("MongoDB button has been pressed.");
                break;
            }
            case "Neo4j": {
                setMessage("Neo4j button has been pressed.");
                try {
                    const productId = parseInt(searchQuery);
                    const data = await getNeoGraph(!isNaN(productId) ? productId : undefined);
                    setNeoGraphData(data);
                } catch (error) {
                    console.error("Error fetching neo4j data:", error);
                }
                break;
            }
            case "Redis": {
                setMessage("Redis button has been pressed.");
                break;
            }
        }
    };

    useEffect(() => {
        if (!searchQuery) {
            setNeoGraphData({ nodes: [], edges: [] });
            setMessage("");
        }
    }, [searchQuery]);

    // the html for the right side
    return (
        <div className="bg-sky-100 w-full h-screen py-4 px-8">
            <div className="buttons-container">
                <button className="btn py-2" onClick={() => handleButtonClick("PostgreSQL")}>
                    PostgreSQL
                </button>
                <button className="btn py-2" onClick={() => handleButtonClick("MongoDB")}>
                    MongoDB
                </button>
                <button className="btn py-2" onClick={() => handleButtonClick("Neo4j")}>
                    Neo4j
                </button>
                <button className="btn py-2" onClick={() => handleButtonClick("Redis")}>
                    Redis
                </button>
            </div>
            <div>
                <br></br>The buttons will each eventually represent a graph when clicked.
            </div>
            {message && <p>{message}</p>}
            {neoGraphData.nodes.length > 0 && <NeoGraph data={neoGraphData} />}
            <div></div>
        </div>
    );
}

interface NeoGraphProps {
    data: { nodes: any[]; edges: any[] };
}

const NeoGraph: React.FC<NeoGraphProps> = ({ data }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.innerHTML = "";
            const network = new Network(containerRef.current, data, {
                nodes: {
                    shape: "dot",
                    size: 16,
                },
                edges: {
                    width: 2,
                },
                physics: {
                    stabilization: false,
                },
            });
        }
    }, [data]);

    return <div ref={containerRef} style={{ height: "500px", width: "100%" }} />;
};