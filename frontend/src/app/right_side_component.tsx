'use client';
/**
 * This module is responsible for creating the right side component.
 *
 * @Author Dalton Rogers
 * @Version 12/4/2024
 */

import React, { useState, useContext, useEffect, useRef } from 'react';
import './right_side_component.css';
import { Product } from '../../../backend/app/src/interfaces';
import {
  getMongoSchema,
  getNeoGraph,
  getPostgresData,
  getProduct,
} from './request';
import { SearchContext } from './searchContext';
import ProductLayout from './product/[id]/page';
import { Network } from 'vis-network/standalone/esm/vis-network';
import { Card } from './components';
import { JsonEditor } from 'json-edit-react';

/**
 * Creates the right side component for the UI.
 *
 * @returns The right side component.
 */
export function RightSide() {
  // initialize the use states
  const [message, setMessage] = useState<string>('');
  const [neoGraphData, setNeoGraphData] = useState<{
    nodes: any[];
    edges: any[];
  }>({ nodes: [], edges: [] });
  const [mongoSchema, setMongoSchema] = useState(null);
  const { searchQuery } = useContext(SearchContext);
  const [postgresData, setPostgresData] = useState<Product[]>([]);

  // handles button clicks, each display a different image
  const handleButtonClick = async (dbName: string) => {
    const productId = parseInt(searchQuery);
    setMessage('');
    setMongoSchema(null);
    setNeoGraphData({ nodes: [], edges: [] });
    switch (dbName) {
      case 'PostgreSQL': {
        setMessage('PostgreSQL button has been pressed.');
        try {
            const productId = parseInt(searchQuery);
            const data = await getPostgresData(!isNaN(productId) ? productId : undefined);
            setPostgresData(data);
        } catch (error) {
            console.error("Error fetching postgres data:", error);
        }
        break;
      }
      case 'MongoDB': {
        setMessage('MongoDB button has been pressed.');
        try {
          let mongoSchema;
          if (!isNaN(productId)) {
            // TODO: bad. Need to lift up selected product into shared parent
            // but too lazy
            // TODO: it would also be nice if it would automatically switch to
            // single product view whenever selecting a product after selecting
            // the mongodb button, but oh well.
            mongoSchema = await getProduct(productId);
          } else {
            mongoSchema = await getMongoSchema();
          }
          setMongoSchema(mongoSchema);
        } catch (error) {
          console.error(`Error occurred while fetching mongodb data: ${error}`);
        }
        break;
      }
      case 'Neo4j': {
        setMessage('Neo4j button has been pressed.');
        try {
          const data = await getNeoGraph(
            !isNaN(productId) ? productId : undefined
          );
          setNeoGraphData(data);
        } catch (error) {
          console.error('Error fetching neo4j data:', error);
        }
        break;
      }
      case 'Redis': {
        setMessage('Redis button has been pressed.');
        break;
      }
    }
  };

  useEffect(() => {
    if (!searchQuery) {
      setNeoGraphData({ nodes: [], edges: [] });
      setMessage('');
    }
  }, [searchQuery]);

  // the html for the right side
  return (
    <div className='h-dvh bg-sky-100 w-full py-4 px-8'>
      <div className='buttons-container'>
        <button
          className='btn py-2'
          onClick={() => handleButtonClick('PostgreSQL')}
        >
          PostgreSQL
        </button>
        <button
          className='btn py-2'
          onClick={() => handleButtonClick('MongoDB')}
        >
          MongoDB
        </button>
        <button className='btn py-2' onClick={() => handleButtonClick('Neo4j')}>
          Neo4j
        </button>
        <button className='btn py-2' onClick={() => handleButtonClick('Redis')}>
          Redis
        </button>
      </div>
      <div>
        <br></br>The buttons will each eventually represent a graph when
        clicked.
      </div>
      {message && <p>{message}</p>}
      {neoGraphData.nodes.length > 0 && <NeoGraph data={neoGraphData} />}
      {mongoSchema && <MongoSchema schema={mongoSchema} />}
      <div></div>
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
      containerRef.current.innerHTML = '';
      const network = new Network(containerRef.current, data, {
        nodes: {
          shape: 'dot',
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

  return <div ref={containerRef} style={{ height: '500px', width: '100%' }} />;
};

function MongoSchema({ schema }: { schema: unknown }) {
  return (
    <div className='h-[calc(100vh-200px)] overflow-auto'>
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
    if (data.length === 0) {
        return <p>No data available</p>;
    }

    return (
        <table className="postgres-data-table">
            <thead>
                <tr>
                    {Object.keys(data[0]).map((key) => (
                        <th key={key}>{key}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, index) => (
                    <tr key={index}>
                        {Object.values(row).map((value, i) => (
                            <td key={i}>{value !== null ? String(value) : "N/A"}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};