"use client";
/**
 * This module is responsible for creating the right side component.
 *
 * @Author Dalton Rogers
 * @Version 12/4/2024
 */

import React, { useContext } from "react";
import "./right_side_component.css";
import { MongoSchema, NeoGraph, PostgresDataTable, RedisDataTable } from "./components";
import { JsonData } from "json-edit-react";
import { Neo4jQueryData, PostgresQueryData, RedisQueryData } from "./request";
import { DbName } from "./enums";
import { SelectedDbContext } from "./selected_db_context";


/**
 * Creates the right side component for the UI.
 *
 * @returns The right side component.
 */
export function RightSide({
    postgresData,
    mongoSchema,
    neoGraphData,
    redisData,
}: {
    postgresData: PostgresQueryData[];
    mongoSchema: JsonData;
    neoGraphData: Neo4jQueryData;
    redisData: RedisQueryData;
}) {
    const {selectedDb, setSelectedDb} = useContext(SelectedDbContext);

    // the html for the right side
    return (
        <div className="h-dvh bg-sky-100 w-full py-4 px-8">
            <div className="buttons-container">
                <button className="btn py-2" onClick={() => setSelectedDb(DbName.postgres)}>
                    PostgreSQL
                </button>
                <button className="btn py-2" onClick={() => setSelectedDb(DbName.mongo)}>
                    MongoDB
                </button>
                <button className="btn py-2" onClick={() => setSelectedDb(DbName.neo4j)}>
                    Neo4j
                </button>
                <button className="btn py-2" onClick={() => setSelectedDb(DbName.redis)}>
                    Redis
                </button>
            </div>
            <div className="h-full">
                {selectedDb === DbName.postgres && <PostgresDataTable data={postgresData} />}
                {selectedDb === DbName.mongo && <MongoSchema schema={mongoSchema} />}
                {selectedDb === DbName.neo4j && <NeoGraph data={neoGraphData} />}
                {selectedDb === DbName.redis && <RedisDataTable data={redisData} />}
            </div>
        </div>
    );
}
