'use client';
/**
 * This module is responsible for creating the right side component.
 *
 * @Author Dalton Rogers
 * @Version 12/4/2024
 */

import React, { useEffect, useRef, ReactNode, useState } from 'react';
import './right_side_component.css';
import { MongoSchema, NeoGraph, PostgresDataTable, RedisDataTable } from './components';
import { 
    getPostgresData, 
    getNeoGraph, 
    getMongoSchema, 
    getRedisData,
    PostgresQueryData, 
    Neo4jQueryData,
    RedisQueryData,
} from './request';
import { setRequestMeta } from 'next/dist/server/request-meta';

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
export function RightSide() {
    const [selected, setSelected] = useState<DbName>(DbName.postgres);
    const [postgresData, setPostgresData] = useState<PostgresQueryData[]>([]);
    const [neoGraphData, setNeoGraphData] = useState<Neo4jQueryData>({nodes: [], edges: []});
    const [mongoSchema, setMongoSchema] = useState<any>();
    const [redisData, setRedisData] = useState<RedisQueryData | null>(null);

    useEffect( () => {
        async function getData() {
            setPostgresData(await getPostgresData());
            setMongoSchema(await getMongoSchema());
            setNeoGraphData(await getNeoGraph());
            setRedisData(await getRedisData(2))
        }
        getData();
    }, [])
    // the html for the right side
    return (
        <div className='h-dvh bg-sky-100 w-full py-4 px-8'>
            <div className='buttons-container'>
                <button
                    className='btn py-2'
                    onClick={() => setSelected(DbName.postgres)}
                >
                    PostgreSQL
                </button>
                <button className='btn py-2' onClick={() => setSelected(DbName.mongo)}>
                    MongoDB
                </button>
                <button className='btn py-2' onClick={() => setSelected(DbName.neo4j)}>
                    Neo4j
                </button>
                <button className='btn py-2' onClick={() => setSelected(DbName.redis)}>
                    Redis
                </button>
            </div>
            <div className='h-full'>
                {selected === DbName.postgres && (
                    <PostgresDataTable data={postgresData} />
                )}
                {selected === DbName.mongo && <MongoSchema schema={mongoSchema} />}
                {selected === DbName.neo4j && <NeoGraph data={neoGraphData} />}
                {selected === DbName.redis && <RedisDataTable data={redisData} />}
            </div>
        </div>
    );
}
