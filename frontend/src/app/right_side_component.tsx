'use client';
/**
 * This module is responsible for creating the right side component.
 *
 * @Author Dalton Rogers
 * @Version 12/4/2024
 */

import React, { useEffect, useRef, ReactNode, useState } from 'react';
import './right_side_component.css';
import { Network } from 'vis-network/standalone/esm/vis-network';
import { Card, MongoSchema, NeoGraph, PostgresDataTable } from './components';
import { JsonEditor, JsonData } from 'json-edit-react';
import { Neo4jQueryData, PostgresQueryData } from './request';

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
  postgresData,
  mongoSchema,
  neoGraphData,
}: {
  postgresData: PostgresQueryData[];
  mongoSchema: JsonData;
  neoGraphData: Neo4jQueryData;
}) {
  const [selected, setSelected] = useState<DbName>(DbName.postgres);

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
        {selected === DbName.redis && 'soy redis'}
      </div>
    </div>
  );
}
