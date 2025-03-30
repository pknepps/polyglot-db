"use client";
/**
 * This module is responsible for creating the right side component.
 *
 * @Author Dalton Rogers
 * @Version 12/4/2024
 */

import React, { useEffect, useRef, ReactNode } from "react";
import "./right_side_component.css";
import { Network } from "vis-network/standalone/esm/vis-network";
import { Card } from "./components";
import { JsonEditor, JsonData } from "json-edit-react";

export enum DbName {
    postgres,
    neo4j,
    redis,
    mongo,
}

/**
 * Creates the right side component for the UI.
 *
 * @returns The right side component.
 */
export function RightSide({
    children,
    handleButtonClick,
}: {
    children: ReactNode;
    handleButtonClick: (dbName: DbName) => void;
}) {
    // the html for the right side
    return (
        <div className="h-dvh bg-sky-100 w-full py-4 px-8">
            <div className="buttons-container">
                <button className="btn py-2" onClick={() => handleButtonClick(DbName.postgres)}>
                    PostgreSQL
                </button>
                <button className="btn py-2" onClick={() => handleButtonClick(DbName.mongo)}>
                    MongoDB
                </button>
                <button className="btn py-2" onClick={() => handleButtonClick(DbName.neo4j)}>
                    Neo4j
                </button>
                <button className="btn py-2" onClick={() => handleButtonClick(DbName.redis)}>
                    Redis
                </button>
            </div>
            <div className="h-full">{children}</div>
        </div>
    );
}

/**
 * Define an interface for neo4j graph props.
 */
interface NeoGraphProps {
    data: { nodes: any[]; edges: any[] };
}

// creates a neo4j graph
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

    return <div ref={containerRef} style={{ height: "600px", width: "100%" }} />;
};

function MongoSchema({ schema }: { schema: JsonData }) {
    return (
        <div className="h-[calc(100vh-200px)] overflow-auto">
            <Card>
                <JsonEditor data={schema} viewOnly={true} collapse={1}></JsonEditor>
            </Card>
        </div>
    );
}

interface PostgresDataTableProps {
    data: Record<string, string | number | null>[];
}

const PostgresDataTable: React.FC<PostgresDataTableProps> = ({ data }) => {
    const columns = ["ProductID", "Name", "Price", "Transactions"];

    if (data.length === 0) {
        return <p>No data available</p>;
    }

    return (
        <div className="table-container">
            <table className="postgres-data-table">
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column}>{column}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index}>
                            {columns.map((column) => (
                                <td key={column}>
                                    {column === "Transactions" ? (
                                        Array.isArray(row.Transactions) && row.Transactions.length > 0 ? (
                                            <ul>
                                                {row.Transactions.map((transaction: any, tIndex: number) => (
                                                    <li key={tIndex}>
                                                        <strong>Transaction ID:</strong> {transaction.transaction_id},{" "}
                                                        <strong>User:</strong> {transaction.username}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            "No Transactions"
                                        )
                                    ) : row[column] !== undefined && row[column] !== null ? (
                                        String(row[column])
                                    ) : (
                                        "N/A"
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
