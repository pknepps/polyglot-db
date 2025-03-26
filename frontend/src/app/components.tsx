import { ReactElement } from "react";
import { Product, ProductReview } from "../../../backend/app/src/interfaces";

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

export function ProductView({ productDetails }: { productDetails: Product }) {
    // get the average rating of the product
    const avg_rating = productDetails
        ? productDetails.ratings.reduce((sum, current) => sum + current.rating, 0) / productDetails.ratings.length
        : null;
    return (
        <div className="text-black">
            <Card>
                <h1 className="text-4xl font-thinbold">{productDetails.name}</h1>
                <span className="text-sm text-gray-600 ml-4 mt-16">id: {productDetails.product_id}</span>

                <div className="bg-slate-300 w-20 rounded-md font-bold text-xl">${productDetails.price.toFixed(2)}</div>
                <Card>
                    <h2 className="font-bold">Ratings and Reviews:</h2>
                    <h4>User Rating: {avg_rating}/5</h4>
                </Card>
                <Card>
                    <h3 className="font-bold">Reviews:</h3>
                    {productDetails.reviews.map((review, i) => (
                        <Card key={i}>
                            <Review review={review} />
                        </Card>
                    ))}
                    {productDetails.reviews.length === 0 && "No reviews"}
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
