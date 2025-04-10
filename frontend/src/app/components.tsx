import { ReactElement, useEffect, useRef } from "react";
import { Product, ProductReview } from "../../../backend/app/src/interfaces";
import Link from "next/link";
import { Network } from "vis-network";
import { JsonData, JsonEditor } from "json-edit-react";
import { Neo4jQueryData, PostgresQueryData, RedisQueryData } from "./request";
import { useRouter } from "next/navigation";

export function Card({ children }: { children: React.ReactNode }) {
    return <div className="bg-slate-200 px-6 py-6 my-4 rounded-md shadow-md">{children}</div>;
}

export function Modal({
    isDisplayed,
    onClose,
    children,
}: {
    isDisplayed: boolean;
    onClose: () => void;
    children: React.ReactNode;
}) {
    return isDisplayed ? (
        <div className="modal-overlay">
            <div className="modal-content">
                {children}
                <button className="btn py-2 mt-6" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    ) : null;
}

export function ProductView({
    productDetails,
    style = "preview",
    recommendations = [],
}: {
    productDetails: Product;
    style: "preview" | "full";
    recommendations: Partial<Product>[];
}) {
    const router = useRouter();
    // get the average rating of the product
    const avgRating = productDetails
        ? productDetails.ratings.reduce((sum, current) => sum + current.rating, 0) / productDetails.ratings.length
        : null;

    const handleBuy = () => {
        router.push("/new/transaction");
    }
    const handleAddReview = () => {
        router.push("/new/review");
    }
    return style === "preview" ? (
        <div>
            <Card>
                <h1 className="text-4xl font-thinbold">{productDetails.name}</h1>
                <span className="text-sm text-gray-600 mt-16">id: {productDetails.product_id}</span>
                <div className="bg-slate-300 w-20 rounded-md font-bold text-xl">${productDetails.price.toFixed(2)}</div>
                <h2 className="font-bold">Ratings and Reviews:</h2>
                <h4>User Rating: {avgRating ? `${avgRating?.toFixed(1)}/5` : "No ratings available"}</h4>
            </Card>
        </div>
    ) : (
        <div>
            <Card>
                <h1 className="text-4xl font-thinbold">{productDetails.name}</h1>
                <span className="text-sm text-gray-600 mt-16">id: {productDetails.product_id}</span>

                <div className="bg-slate-300 w-20 rounded-md font-bold text-xl">${productDetails.price.toFixed(2)}</div>
                <button className="btn2 btn2-blue" onClick={handleBuy}>Purchase</button>
                <Card>
                    <h2 className="font-bold">Ratings and Reviews:</h2>
                    <h4>User Rating: {avgRating ? `${avgRating?.toFixed(1)}/5` : "No ratings available"}</h4>
                </Card>
                <button className="btn2 btn2-blue" onClick={handleAddReview}>Add Review</button>
                <Card>
                    <h3 className="font-bold">Reviews:</h3>
                    {productDetails.reviews.map((review, i) => (
                        <Card key={i}>
                            <Review review={review} />
                        </Card>
                    ))}
                    {productDetails.reviews.length === 0 && "No reviews"}
                </Card>
                <Card>
                    <h3 className="font-bold">Recommended Products:</h3>
                    <div className="flex flex-wrap">
                        {recommendations?.map((product, i) => (
                            <Card key={i}>
                                <PartialProduct product={product} />
                            </Card>
                        ))}
                    </div>
                </Card>
            </Card>
        </div>
    );
}

/**
 * Helper function which creates cards for each review.
 * @param props Contains the product in which the reviews are located
 * @returns An array of review cards.
 */
function Review({ review }: { review: ProductReview }): ReactElement {
    return (
        <div>
            <h4 className="font-semibold">{review.username}</h4>
            <p className="m-1">{review.review}</p>
        </div>
    );
}

/**
 * Helper function which creates cards for each recommended product.
 * @param props Contains the product.
 * @returns A product card.
 */
function PartialProduct({ product }: { product: Partial<Product> }): ReactElement {
    return (
        <Link href={`${product.product_id}`}>
            <div>
                <h4 className="font-semibold">{product.name}</h4>
                <span className="text-sm text-gray-600 mt-16">id: {product.product_id}</span>
                <p className="bg-slate-300 w-12 rounded-md font-bold text-xl">${product.price!.toFixed(2)}</p>
            </div>
        </Link>
    );
}

/**
 * Define an interface for neo4j graph props.
 */
export interface NeoGraphProps {
    data: Neo4jQueryData;
}

// creates a neo4j graph
export const NeoGraph: React.FC<NeoGraphProps> = ({ data }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.innerHTML = "";
            new Network(containerRef.current, data, {
                nodes: {
                    shape: "dot",
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

    return <div ref={containerRef} style={{ height: "600px", width: "100%" }} />;
};

export function MongoSchema({ schema }: { schema: JsonData }) {
    return (
        <div className="h-[calc(100vh-200px)] overflow-auto">
            <Card>
                <JsonEditor data={schema} viewOnly={true} collapse={1}></JsonEditor>
            </Card>
        </div>
    );
}

export function PostgresDataTable({ data }: { data: PostgresQueryData[] }) {
    if (data.length === 0) {
        return <p>No data available</p>;
    }

    return (
        <div className="table-container">
            <table className="postgres-data-table">
                <thead>
                    <tr>
                        <th>ProductID</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Transactions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr key={row.ProductID}>
                            <td>{row.ProductID}</td>
                            <td>{row.Name}</td>
                            <td>{row.Price}</td>
                            <td>
                                <ul>
                                    {row.Transactions.map(({ transaction_id, username }) => (
                                        <li key={transaction_id}>
                                            <strong>Transaction ID:</strong> {transaction_id}, <strong>User:</strong>{" "}
                                            {username}
                                        </li>
                                    ))}
                                </ul>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function RedisDataTable({data}: {data: RedisQueryData | null}) {
    if (!data) {
        return <div> No data found </div>
    }
    return (
        <div className="table-container">
            {data.shard == null ? <div></div> : <div>
            <h2><b>Current Shard:</b></h2>
            <table className="postgres-data-table">
                <thead>
                    <tr>
                        <th>ProductID</th>
                        <th>Shard Address</th>
                    </tr>
                </thead>
                <tbody>
                    {<tr key={data.shard?.[0]}>
                        <td>{data.shard?.[0]}</td>
                        <td>{data.shard?.[1]}</td>
                    </tr>}
                </tbody>
            </table>
            </div>}   
            <h2><b>Cached Data</b></h2>
            {data.cachedData.length == 0 ? <div>No cached data</div> 
            : <table className="postgres-data-table">
                <thead>
                    <tr>
                        <th>ProductID</th>
                        <th>Product</th>
                    </tr>
                </thead>
                <tbody>
                    {data.cachedData.map(([id, product]) => (
                        <tr key={id}>
                            <td>{id}</td>
                            <td>
                                <JsonEditor data={JSON.parse(product)} viewOnly={true} collapse={0}/>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>}
        </div>
    );
}
