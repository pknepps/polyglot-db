import { randUser, randProduct, randRatings, randReviews, randTransaction, getUserNames, getProductIDs } from "../src/generators";

/**
 * Test the randUser function.
 */
describe('randUser function', () => {
    test('should return a user object with the correct properties', () => {
        const user = randUser()[1];
        expect(user).toHaveProperty('username');
        expect(user).toHaveProperty('payments');
        expect(user).toHaveProperty('firstName');
        expect(user).toHaveProperty('lastName');
        expect(user).toHaveProperty('middleName');
        expect(user).toHaveProperty('addresses');
        expect(user).toHaveProperty('transactions');
        expect(user).toHaveProperty('ratings');
        expect(user).toHaveProperty('reviews');
    });

    test('should generate a unique username', () => {
        const user1 = randUser()[1];
        const user2 = randUser()[1];
        expect(user1.username).not.toEqual(user2.username);
    });
});

/**
 * Test the randProduct function.
 */
describe('randProduct function', () => {
    test('should return a product object with the correct properties', () => {
        const product = randProduct()[1];
        expect(product).toHaveProperty('product_id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('ratings');
        expect(product).toHaveProperty('reviews');
    });
});

/**
 * Test the randRatings function.
 */
describe('randRatings function', () => {
    test('should return an array of ratings with the correct properties', async () => {
        const ratings = await randRatings(5);
        expect(ratings).toHaveLength(5);
        ratings.forEach(rating => {
            expect(rating).toHaveProperty('username');
            expect(rating).toHaveProperty('product_id');
            expect(rating).toHaveProperty('rating');
        });
    });

    test('should return a promise', async () => {
        const ratings = randRatings(5);
        expect(ratings).toBeInstanceOf(Promise);
    });
});

/**
 * Test the randReviews function.
 */
describe('randReviews function', () => {
    test('should return an array of reviews with the correct properties', async () => {
        const reviews = await randReviews(5);
        expect(reviews).toHaveLength(5);
        reviews.forEach(review => {
            expect(review).toHaveProperty('username');
            expect(review).toHaveProperty('product_id');
            expect(review).toHaveProperty('review');
        });
    });

    test('should return a promise', async () => {
        const reviews = randReviews(5);
        expect(reviews).toBeInstanceOf(Promise);
    });
});

/**
 * Test the randTransaction function.
 */
describe('randTransaction function', () => {
    test('should return a transaction object with the correct properties', async () => {
        const transaction = await randTransaction(5);
        expect(transaction).toHaveLength(5);
        transaction.forEach(item => {
            expect(item).toHaveProperty('transactionId');
            expect(item).toHaveProperty('username');
            expect(item).toHaveProperty('productId');
            expect(item).toHaveProperty('cardNum');
            expect(item).toHaveProperty('address');
            expect(item).toHaveProperty('city');
            expect(item).toHaveProperty('state');
            expect(item).toHaveProperty('zip');
        });
    });

    test('should return a promise', async () => {
        const transaction = randTransaction(5);
        expect(transaction).toBeInstanceOf(Promise);
    });
});

/**
 * Test the getUserNames function.
 */
describe('getUserNames function', () => {
    test('should return an array of usernames', async () => {
        const usernames = await getUserNames();
        expect(usernames).toBeInstanceOf(Array);
        usernames.forEach(user => {
            expect(user).toHaveProperty('username');
        });
    });

    test('should return a promise', async () => {
        const usernames = getUserNames();
        expect(usernames).toBeInstanceOf(Promise);
    });
});

/**
 * Test the getProductIDs function.
 */
describe('getProductIDs function', () => {
    test('should return an array of product IDs', async () => {
        const productIDs = await getProductIDs();
        expect(productIDs).toBeInstanceOf(Array);
        productIDs.forEach(product => {
            expect(product).toHaveProperty('product_id');
        });
    });

    test('should return a promise', async () => {
        const productIDs = getProductIDs();
        expect(productIDs).toBeInstanceOf(Promise);
    });
});