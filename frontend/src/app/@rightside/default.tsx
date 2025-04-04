import { RightSide } from '../right_side_component';
import { getMongoSchema, getNeoGraph, getPostgresData } from '../request';

export default async function RightSideAllProducts() {
  const postgresData = await getPostgresData();
  const neoGraphData = await getNeoGraph();
  const mongoSchema = await getMongoSchema();

  return (
    <RightSide
      postgresData={postgresData}
      mongoSchema={mongoSchema}
      neoGraphData={neoGraphData}
    ></RightSide>
  );
}
