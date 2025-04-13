/**
 * The functions in this module are used to generate random date to dump into
 * the databases.
 *
 * @author Preston Knepper
 * @version Oct. 2, 2024
 */

// these are the required imports
import { UserRecord, ProductRecord, TransactionRecord, User, Product } from "./interfaces";
import { faker } from "@faker-js/faker";
import { sanitize, db} from "./index";

/** Generates a new user. **/
export function randUser(): [UserRecord, User] {
    const firstName = sanitize(faker.person.firstName());
    const lastName = sanitize(faker.person.lastName());
    const middleName = sanitize(faker.person.middleName());
    const userRecord: UserRecord = {
        username: firstName[0] + lastName + Math.floor(Math.random() * 100),
        firstName,
        lastName,
    };
    const user: User = {
        username: userRecord.username,
        firstName,
        lastName,
        middleName,
        addresses: [],
        payments: [],
        transactions: [],
        ratings: [],
        reviews: [],
    };
    return [userRecord, user];
}

/**
 * Generates a new product, minus the product code.
 */
export function randProduct(): [ProductRecord, Product] {
    const productRecord: ProductRecord = {
        productId: 0,
        name: faker.word.adjective() + ", " + faker.word.adjective() + " " + faker.word.noun(),
        price: parseFloat((Math.random() * 500).toFixed(2)),
    };
    const product: Product = {
        product_id: productRecord.productId,
        name: productRecord.name,
        price: productRecord.price,
        ratings: [],
        reviews: [],
    };
    return [productRecord, product];
}

/**
 * Creates a list of random user reviews from currently existing users.
 * @param n the number of ratings to generate. Used so that only one query needs to be made for
 *          several ratings.
 */
export async function randRatings(n: number): Promise<
    {
        username: string;
        product_id: number;
        rating: number;
    }[]
> {
    try {
        const usernames = await getUserNames();
        const product_ids = await getProductIDs();
        const ratings: {
            username: string;
            product_id: number;
            rating: number;
        }[] = [];
        for (let i = 0; i < n; i++) {
            const username: string = usernames[Math.floor(Math.random() * usernames.length)].username;
            const product_id = product_ids[Math.floor(Math.random() * product_ids.length)].product_id;
            ratings.push({
                username,
                product_id,
                rating: Math.floor(Math.random() * 5),
            });
        }
        return ratings;
    } catch (error) {
        console.log("failed to get usernames or product id's\n");
    }
    return new Promise((resolve, reject) => reject());
}

/**
 * Creates a list of random user reviews from currently existing users.
 * @param n the number of reviews to generate. Used so that only one query needs to be made for
 *          several reviews.
 */
export async function randReviews(n: number): Promise<
    {
        username: string;
        product_id: number;
        review: string;
    }[]
> {
    try {
        const usernames = await getUserNames();
        const product_ids = await getProductIDs();
        const reviews: {
            username: string;
            product_id: number;
            review: string;
        }[] = [];
        for (let i = 0; i < n; i++) {
            const username: string = usernames[Math.floor(Math.random() * usernames.length)].username;
            const product_id = product_ids[Math.floor(Math.random() * product_ids.length)].product_id;
            reviews.push({
                username,
                product_id,
                review: faker.lorem.paragraph({ min: 1, max: 10 }),
            });
        }
        return reviews;
    } catch (e) {
        console.log("failed to get usernames or product id's\n", e);
    }
    return new Promise((resolve, reject) => reject());
}

/**
 * Creates a list of random transactions of random existing users buying  random existing products.
 * @param n The number of transactions to make. Used so that only one query needs to be made for
 *          several ratings.
 */
export async function randTransaction(n: number): Promise<TransactionRecord[]> {
    const transactions: TransactionRecord[] = [];
    let usernames: { username: string }[]
    let products: { product_id: number }[]
    try {
        usernames = await getUserNames();
        products = await getProductIDs();
    } catch (error) {
        console.log("Postgres rejected query with error: ", error);
        throw error;
    }
    if (usernames.length == 0) {
        throw new Error("No users available to generate transactions");
    }
    if (products.length == 0) {
        throw new Error("No products available to generate transactions");
    }
    for (let i = 0; i < n; i++) {
        const username: string = usernames[Math.floor(Math.random() * usernames.length)].username;
        const productId: number = products[Math.floor(Math.random() * products.length)].product_id;
        transactions.push({
            transactionId: 0,
            username,
            productId,
            cardNum: parseInt(faker.finance.creditCardNumber("################")),
            address: sanitize(faker.location.streetAddress()),
            city: sanitize(faker.location.city()),
            state: sanitize(faker.location.state({ abbreviated: true })),
            zip: parseInt(faker.location.zipCode("#####")),
        });
    }
    return transactions;
}

/**
 * Helper function which queries for all active users and returns the list of usernames.
 */
function getUserNames(): Promise<{ username: string }[]> {
    return db.query("SELECT username FROM USERS").then((data) => data.rows as any as { username: string }[])
}

/**
 * Helper function which queries for all active products and returns the list of product id's.
 */
async function getProductIDs(): Promise<{ product_id: number }[]> {
    return db.query("SELECT product_id FROM PRODUCTS").then((data) => data.rows as any as { product_id: number }[])
}
