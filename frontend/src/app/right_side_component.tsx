"use client";
/**
 * This module is responsible for creating the right side component.
 *
 * @Author Dalton Rogers
 * @Version 12/4/2024
 */

import React, { ReactNode } from "react";
import "./right_side_component.css";

/**
 * Creates the right side component for the UI.
 *
 * @returns The right side component.
 */
export function RightSide({
    handleButtonClick,
    children,
}: {
    handleButtonClick: (dbName: string) => void;
    children: ReactNode;
}) {
    return (
        <div className="h-dvh bg-sky-100 w-full py-4 px-8">
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
            <div className="h-full">{children}</div>
        </div>
    );
}
