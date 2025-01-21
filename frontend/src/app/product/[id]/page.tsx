"use client"

import {ReactElement, useEffect, useState} from "react";
import {getProduct} from "@/app/request";
import {Product} from "../../../../../backend/app/src/interfaces"

/**
 * Creates a layout for the given product id
 * @param props Contains an id for the product the user wishes to see.
 */
export default function ProductLayout(
    { params, }: { params: Promise<{ id: number }> },
): ReactElement {
    const [product, setProduct] = useState(
        {product_id:0,name:"",price:0.0,ratings:[],reviews:[]} as Product
    );
    useEffect(() => {
        async function fetch() {
            const id = (await params).id;
            const product = await getProduct(id);
            setProduct(product);
        }
        fetch().then(r => r);
    }, [params]);
    const avg_rating = product.ratings
        .reduce((sum, current) => sum + current.rating, 0) / product.ratings.length;
    return (<div>
        <h1>{product.name}</h1>
        <h3>id: {product.product_id}</h3>
        <h4>{product.price.toFixed(2)}</h4>
        <h2>Ratings and Reviews:</h2>
        <h4>User Rating: {avg_rating}/5</h4>
        <h3>Reviews:</h3>
        <Reviews product={product}/>
    </div>);
}


/**
 * Helper function which creates cards for each review.
 * @param props Contains the product in which the reviews are located
 * @returns An array of review cards.
 */
function Reviews(props: {product: Product}): Array<ReactElement> {
    const reviews = props.product.reviews;
    // const ratings = props.product.ratings;
    const cards = new Array<ReactElement>();
    for (let i = 0; i < reviews.length; i++) {
        cards.push(<div>
            <h4>{reviews[i].username}</h4>
            <p>{reviews[i].review}</p>
        </div>)
    }
    return cards;
}