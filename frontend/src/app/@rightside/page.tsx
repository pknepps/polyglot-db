import { Suspense, use, useState } from "react";
import { DbName, RightSide } from "../right_side_component";
import { getMongoSchema, getNeoGraph, getPostgresData, testPromise } from "../request";
import { MongoSchema, NeoGraph, PostgresDataTable } from "../components";
import PromiseEater from "./furthertesting";

export default function RightSideAllProducts() {
    const myPromise = testPromise();
    // const postgresData = use(getPostgresData());
    // const neoGraphData = use(getNeoGraph());
    // const mongoSchema = use(getMongoSchema());
    // const [selected, setSelected] = useState<DbName>(DbName.postgres);

    // return (
    //     <RightSide handleButtonClick={(dbName: DbName) => setSelected(dbName)}>
    //         {selected === DbName.postgres && <PostgresDataTable data={postgresData} />}
    //         {selected === DbName.mongo && <MongoSchema schema={mongoSchema} />}
    //         {selected === DbName.neo4j && <NeoGraph data={neoGraphData} />}
    //         {selected === DbName.neo4j && "hi"}
    //     </RightSide>
    // );
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PromiseEater promise={myPromise} />;
        </Suspense>
    );
}
