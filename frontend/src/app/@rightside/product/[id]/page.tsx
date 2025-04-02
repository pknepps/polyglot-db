import { getPostgresData, getNeoGraph, getProduct } from '@/app/request';
import { RightSide } from '@/app/right_side_component';

export default async function RightSideSingleProduct({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const productId = Number((await params).id);
  if (isNaN(productId)) {
    console.log(productId);
    return 'Invalid id passed in.';
  }
  const postgresData = await getPostgresData(productId);
  const neoGraphData = await getNeoGraph(productId);
  const mongoSchema = await getProduct(productId);

  return (
    <RightSide
      postgresData={postgresData}
      mongoSchema={mongoSchema}
      neoGraphData={neoGraphData}
    ></RightSide>
  );
}
