import { getPostgresData, getNeoGraph, getProduct, getRedisData } from "@/app/request";
import { RightSide } from "@/app/right_side_component";

export default async function RightSideSingleProduct({ params }: { params: Promise<{ id: string }> }) {
    const productId = Number((await params).id);
    if (isNaN(productId)) {
        console.log(productId);
        return "Invalid id passed in.";
    }
    const postgresData = await getPostgresData(productId);
    const neoGraphData = await getNeoGraph(productId);
    const mongoSchema = await getProduct(productId);
    const redisData = await getRedisData(productId);

    return (
        <RightSide
            postgresData={postgresData}
            mongoSchema={mongoSchema}
            neoGraphData={neoGraphData}
            redisData={redisData}
        ></RightSide>
    );
}
