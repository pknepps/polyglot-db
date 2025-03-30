"use client";

import { use, useState } from "react";
import { DbName, RightSide } from "../right_side_component";
import { getMongoSchema, getNeoGraph, getPostgresData } from "../request";
import { MongoSchema, NeoGraph, PostgresDataTable } from "../components";

export default function RightSideAllProducts() {
    const postgresData = use(getPostgresData());
    const neoGraphData = use(getNeoGraph());
    const mongoSchema = use(getMongoSchema());
    const [selected, setSelected] = useState<DbName>(DbName.postgres);

    return (
        <RightSide handleButtonClick={(dbName: DbName) => setSelected(dbName)}>
            {selected === DbName.postgres && <PostgresDataTable data={[]} />}
            {selected === DbName.mongo && <MongoSchema schema={mongoSchema} />}
            {selected === DbName.neo4j && (
                <NeoGraph
                    data={{
                        nodes: [],
                        edges: [],
                    }}
                />
            )}
            {selected === DbName.neo4j && "hi"}
        </RightSide>
    );
}
