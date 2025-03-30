import { ReactElement, useContext, useEffect, useRef, useState } from "react";
import { getMongoSchema, getNeoGraph, getPostgresData, getProduct, getRecommendations } from "@/app/request";
import { Product } from "../../../../../backend/app/src/interfaces";
import { Card, MongoSchema, NeoGraph, PostgresDataTable, ProductView } from "@/app/components";
import { JsonData, JsonEditor } from "json-edit-react";
import { LeftSide } from "@/app/left_side_pane";
import { RightSide } from "@/app/right_side_component";

/**
 * Interface for the ProductLayout component. product_id is the id of the product the
 * user wishes to see.
 */
interface ProductLayoutProps {
    product_id: number;
    params: Promise<{ id: string }>;
}

/**
 * Creates a layout for the given product id
 * @param params Route param that contains an id for the product the user wishes to see.
 */
export default async function ProductLayout({ params }: ProductLayoutProps) {
    // right side component crap
    const [neoGraphData, setNeoGraphData] = useState<{
        nodes: any[];
        edges: any[];
    }>({ nodes: [], edges: [] });
    const [mongoSchema, setMongoSchema] = useState<JsonData | null>(null);
    const [postgresData, setPostgresData] = useState<Product[]>([]);
    const productId = Number((await params).id);
    if (isNaN(productId)) {
        throw Error("Invalid productID");
    }
    const productDetails = await getProduct(productId);
    const recommendations = await getRecommendations(productId);

    // handles button clicks, each display a different image
    const handleButtonClick = async (dbName: string) => {
        setMongoSchema(null);
        setNeoGraphData({ nodes: [], edges: [] });
        setPostgresData([]);
        switch (dbName) {
            case "PostgreSQL": {
                try {
                    const data = await getPostgresData(productId);
                    setPostgresData(data);
                } catch (error) {
                    console.error("Error fetching postgres data:", error);
                }
                break;
            }
            case "MongoDB": {
                try {
                    const mongoSchema = await getProduct(productId);
                    setMongoSchema(mongoSchema);
                } catch (error) {
                    console.error(`Error occurred while fetching mongodb data: ${error}`);
                }
                break;
            }
            case "Neo4j": {
                try {
                    const data = await getNeoGraph(!isNaN(productId) ? productId : undefined);
                    setNeoGraphData(data);
                } catch (error) {
                    console.error("Error fetching neo4j data:", error);
                }
                break;
            }
            case "Redis": {
                break;
            }
        }
    };

    // nicely format the product details
    return (
        <div>
            <LeftSide>
                productDetails ? (
                <ProductView productDetails={productDetails} style="full" recommendations={recommendations} />) : (
                <div>Loading...</div>)
            </LeftSide>
            <RightSide handleButtonClick={handleButtonClick}>
                {postgresData.length > 0 && (
                    <PostgresDataTable
                        data={postgresData.map((product) =>
                            Object.fromEntries(Object.entries(product).map(([key, value]) => [key, value ?? null]))
                        )}
                    />
                )}
                {neoGraphData.nodes.length > 0 && <NeoGraph data={neoGraphData} />}
                {mongoSchema && <MongoSchema schema={mongoSchema} />}
            </RightSide>
        </div>
    );
}
