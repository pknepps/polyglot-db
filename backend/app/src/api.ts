/**
 * This module is responsible for working with the API to GET, PUT, and POST
 * the various pieces of information.
 *
 * @Author Preston Knepper and Dalton Rogers
 * @Version 11/19/2024
 */

// these are the required imports
import { Router, Request, Response } from 'express';
import { db } from './index';
import {
  getProduct,
  getUser,
  getProducts,
  getAllProducts,
  getNeoGraph,
  getPostgresData,
  getProductByName
} from './get';
import { Db } from 'mongodb';
import { newProduct, newUser, newTransaction } from './create';
import {
  Product,
  ProductRecord,
  User,
  UserRecord,
  TransactionRecord,
} from './interfaces';
import { addReview, addRating, updateProduct, updateUser } from './update';
import { recommend_from_product } from './recommend';
import {
  randProduct,
  randRatings,
  randReviews,
  randTransaction,
  randUser,
} from './generators';

/**
 * Creates an Express router, which is used to define and handle API routes for the
 * application.
 *
 * @param mongo_db The mongo database to query.
 * @returns The Express Router.
 */
export function createRouter() {
  const router = Router();
  apiGetProduct(router);
  apiPostProduct(router);
  apiPutProduct(router);
  apiGetUser(router);
  apiPostUser(router);
  apiPutUser(router);
  apiPostTransaction(router);
  apiPostReview(router);
  apiPostRating(router);
  apiGetRecommendation(router);
  apiGetProducts(router);
  apiGenerateProducts(router);
  apiGenerateUsers(router);
  apiGenerateTransactions(router);
  apiGenerateReviews(router);
  apiGetAllProducts(router);
  apiGetNeoGraph(router);
  apiGetPostgresData(router);
  apiGetMongoSchema(router);
  apiGetProductByName(router);
  return router;
}

/**
 * Adds a route to GET the product of the given id.
 *
 * @param router The Express router to add the request to.
 * @param mongo_db The mongo database to query.
 */
function apiGetProduct(router: Router) {
  router.get('/product/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    console.log(`Received GET request for product ${id}`);
    getProduct(id)
      .then((product) => res.json(product))
      .catch((_) => res.status(404).send('Not Found.\n'));
  });
}

/**
 * Adds a route to GET products by its name.
 *
 * @param router The Express router to add the request to.
 */
function apiGetProductByName(router: Router) {
  router.get('/product/name/:name', async (req: Request, res: Response) => {
      const encodedName = req.params.name;
      const name = decodeURIComponent(encodedName); // decode the name
      console.log(`Received GET request for products with name "${name}"`);
      try {
          const product = await getProductByName(name);
          if (product) {
              res.json(product);
          } else {
              res.status(404).send(`Product with name "${name}" not found.`);
          }
      } catch (error) {
          console.error(`Error fetching product by name: ${error}`);
          res.status(500).send("Internal Server Error");
      }
  });
}

/**
 * Adds a route to get the Neo4j graph data for the given product id.
 *
 * @param router The Express router to add the request to.
 */
function apiGetNeoGraph(router: Router) {
  router.get('/neo/graph/:pid?', async (req: Request, res: Response) => {
    const pid = req.params.pid ? Number(req.params.pid) : undefined;
    try {
      const graph = await getNeoGraph(pid);
      res.json(graph);
    } catch (error) {
      console.error('Error fetching Neo4j graph data:', error);
      res.status(500).send('Internal Server Error');
    }
  });
}

/**
 * Adds a route to get the mongodb schema.
 *
 * @param router The Express router to add the request to.
 */
function apiGetMongoSchema(router: Router) {
  
  router.get('/mongodb/schema', async (req: Request, res: Response) => {
    try {
      const schema = await getAllProducts();
      if (schema === null) {
        throw new Error(`Could not fetch schema. Schema is null.`);
      }
      res.json(schema);
    } catch (error) {
      console.error('Error fetching mongodb graph data:', error);
      res.status(500).send('Internal Server Error');
    }
  });
}

/**
 * Adds a route to get the PostgreSQL data for the given product id.
 *
 * @param router The Express router to add the request to.
 */
function apiGetPostgresData(router: Router) {
  router.get('/postgres/:pid?', async (req: Request, res: Response) => {
    const pid = req.params.pid ? Number(req.params.pid) : undefined;
    try {
      const data = await getPostgresData(pid);
      res.json(data);
    } catch (error) {
      console.error('Error fetching PostgreSQL data:', error);
      res.status(500).send('Internal Server Error');
    }
  });
}

/**
 * Finds the user based on the username provided, then responds with this user
 * or responds with the message that it cannot be found.
 *
 * @param router The Express Router to add the request to.
 * @param mongo_db The mongo database to query.
 */
function apiGetUser(router: Router) {
  router.get('/user/:username', (req: Request, res: Response) => {
    const username = String(req.params.username);
    console.log(`Received GET request for user ${username}`);
    getUser(username)
      .then((user) => res.json(user))
      .catch((_) => res.status(404).send('Not Found.\n.'));
  });
}

/**
 * Adds a route to POST a new product.
 *
 * @param router The router to add the request to.
 * @param mongo_db The mongo database to query.
 */
function apiPostProduct(router: Router) {
  router.post("/product/", (req: Request, res: Response) => {
    try {
      const product_data = req.body;
      console.log(`Received POST request for products: ${product_data}`);
      const { name, price } = product_data;
      const product: Product = {
        product_id: 0,
        name,
        price: Number(price),
        ratings: [],
        reviews: [],
      };

      const record: ProductRecord = {
        productId: 0,
        name,
        price,
      };

      newProduct(record, product);
      res.status(200).json({
        message: "Product added successfully.",
        product: newProduct,
    });
    } catch (e) {
      console.log(e);
      res.status(400).send('Invalid parameters\n');
    }
  });
}

/**
 * Adds a route to PUT an update on an existing product with the given id.
 *
 * @param router The router to add the request to.
 * @param mongo_db The mongo database to query.
 */
function apiPutProduct(router: Router) {
  router.put('/product/:id', (req: Request, res: Response) => {
    try {
      const product_data = req.body;
      const id = Number(req.params.id);
      console.log(`Received PUT request for products: ${product_data}`);
      product_data['product_id'] = id;
      updateProduct(product_data);
      res.status(200).send('Product updated.\n');
    } catch (e) {
      console.log(e);
      res.status(400).send('Invalid parameters or product_id.\n');
    }
  });
}

/**
 * Adds a route to POST a new User.
 *
 * @param router The router to add the request to.
 * @param mongo_db The mongo database to query.
 */
function apiPostUser(router: Router) {
  router.post('/user/', (req: Request, res: Response) => {
    try {
      const { username, first, last } = req.body;
      const user: User = {
        username,
        firstName: first,
        lastName: last,
        middleName: '',
        addresses: [],
        payments: [],
        transactions: [],
        ratings: [],
        reviews: [],
      };
      const userRecord: UserRecord = {
        username,
        firstName: first,
        lastName: last,
      };
      newUser(userRecord, user);
      res.status(200).send('User added.\n');
    } catch (e) {
      console.log(e);
      res.status(400).send('Invalid parameters.\n');
    }
  });
}

/**
 * Adds a new Route to POST a new transaction.
 *
 * @param router The router to add the request to.
 * @param mongo_db The mongo database to query.
 */
function apiPostTransaction(router: Router) {
  router.post('/transaction/', (req: Request, res: Response) => {
    try {
      const { username, productId, cardNum, address, city, state, zip } =
        req.body;
      console.log(
        `Received POST request for transaction ${productId}, and ${username}`
      );

      const transaction: TransactionRecord = {
        transactionId: 0,
        username,
        productId: Number(productId),
        cardNum: Number(cardNum),
        address,
        city,
        state,
        zip: Number(zip),
      };

      newTransaction(transaction);
      res.status(200).send('Transaction added\n');
    } catch (e) {
      console.log(e);
      res.status(400).send('Invalid parameters\n');
    }
  });
}

/**
 * Adds a route to POST the review from the given username, for the given product_id.
 *
 * @param router The router to add the request to.
 * @param mongo_db The mongo database to query.
 */
function apiPostReview(router: Router) {
  router.post('/review/', (req: Request, res: Response) => {
    try {
      const data = req.body;
      console.log(`Received POST request for review: ${data}`);
      addReview(data);
      res.status(200).send('Review added\n');
    } catch (e) {
      console.log(e);
      res.status(400).send('Invalid parameters\n');
    }
  });
}

/**
 * Adds a route to POST the rating from the given username, for the given product_id.
 *
 * @param router The router to add the request to.
 * @param mongo_db The mongo database to query.
 */
function apiPostRating(router: Router) {
  router.post('/rating/', (req: Request, res: Response) => {
    try {
      const data = req.body;
      console.log(`Received POST request for rating ${data}`);
      addRating(data);
      res.status(200).send('Rating added\n');
    } catch (e) {
      console.log(e);
      res.status(400).send('Invalid parameters\n');
    }
  });
}

/**
 * Adds a route to GET 5 recommendations for the given product id.
 *
 * @param router The router to add the request to.
 */
function apiGetRecommendation(router: Router) {
  router.get('/recommendations/:id', (req: Request, res: Response) => {
    const product_id = Number(req.params.id);
    console.log(
      `Received GET recommendation request for product ${product_id}`
    );
    recommend_from_product(product_id)
      .then((products) => res.json(products))
      .catch((_) => res.status(404).send('Not Found\n'));
  });
}

/**
 * Adds a route to PUT an update on an existing user with the given username.
 *
 * @param router The router to add the request to.
 * @param mongo_db The mongo database to query.
 */
function apiPutUser(router: Router) {
  router.put('/user/:username', (req: Request, res: Response) => {
    try {
      const user_data = req.body;
      const username = String(req.params.username);
      console.log(`Received PUT request for user: ${user_data}`);
      user_data['username'] = username;
      updateUser(user_data);
      res.status(200).send('User updated.\n');
    } catch (e) {
      console.log(e);
      res.status(400).send('Invalid parameters or username.\n');
    }
  });
}

/**
 * Adds a route to get the first n products in the database.
 *
 * @param router The Express router to add the request to.
 * @param mongo_db The mongo database to query.
 */
function apiGetProducts(router: Router) {
  router.get('/products/:number', (req: Request, res: Response) => {
    getProducts(parseInt(req.params.number))
      .then((products) => res.json(products))
      .catch((_) => res.status(404).send('Not Found\n'));
  });
}

/**
 * Adds a route to get all products in the database.
 *
 * @param router The Express router to add the request to.
 * @param mongo_db The mongo database to query.
 */
function apiGetAllProducts(router: Router) {
  router.get('/products/all', (res: Response) => {
    getAllProducts()
      .then((products) => {
        console.log(res.json(products))
        res.json(products)
  })
      .catch((_) => res.status(404).send('Not Found\n'));
  });
}

/**
 * Adds a route to generate `quantity` random users.
 *
 * @param router The router to add the request to.
 * @param mongo_db The mongo database to query.
 */
function apiGenerateUsers(router: Router) {
    router.post("/generate/users", async (req: Request, res: Response) => {
        try {
            const { quantity } = req.body;
            const newUserPromises = [];
            for (let i = 0; i < quantity; i++) {
                let [userRecord, user] = randUser();
                newUserPromises.push(newUser(userRecord, user));
            }
            await Promise.all(newUserPromises);
            const successMessage = `Inserted ${quantity} random users into the USERS table.`;
            console.log(successMessage);
            res.status(200).send(successMessage);
        } catch (e) {
            console.log(e);
            res.status(400).send("Invalid parameters.\n");
        }
    });
}

/**
 * Adds a route to generate `quantity` random products.
 *
 * @param router The router to add the request to.
 * @param mongo_db The mongo database to query.
 */
function apiGenerateProducts(router: Router) {
    router.post("/generate/products", async (req: Request, res: Response) => {
        try {
            const { quantity } = req.body;
            const newProductPromises = [];
            for (let i = 0; i < quantity; i++) {
                let [productRecord, product] = randProduct();
                newProductPromises.push(newProduct(productRecord, product));
            }
            await Promise.all(newProductPromises);
            const successMessage = `Inserted ${quantity} random products into the PRODUCTS table.`;
            console.log(successMessage);
            res.status(200).send(successMessage);
        } catch (e) {
            console.log(e);
            res.status(400).send("Invalid parameters.\n");
        }
    });
}

/**
 * Adds a route to generate `quantity` random transactions.
 *
 * @param router The router to add the request to.
 * @param mongo_db The mongo database to query.
 */
function apiGenerateTransactions(router: Router) {
    router.post("/generate/transactions", async (req: Request, res: Response) => {
        const { quantity } = req.body;
        await randTransaction(quantity)
            .then(async (result) => {
                await Promise.all(result.map((transaction) => newTransaction(transaction)));
                const successMessage = `Inserted ${quantity} random transactions into the TRANSACTIONS table.`;
                console.log(successMessage);
                res.status(200).send(successMessage);
            })
            .catch((e) => {
                console.log("An exception has occurred while inserting into transactions: " + e);
                console.log(e);
                res.status(400).send("Invalid parameters.\n");
            });
    });
}

/**
 * Adds a route to generate `quantity` random reviews and ratings.
 *
 * @param router The router to add the request to.
 * @param mongo_db The mongo database to query.
 */
function apiGenerateReviews(router: Router) {
    router.post("/generate/reviews", async (req: Request, res: Response) => {
        const { quantity } = req.body;
        const ratingsPromise = randRatings(quantity)
            .then(async (result) => {
                await Promise.all(result.map((rating) => addRating(rating)));
                console.log(`Added ${quantity} random ratings to users and products.`);
            })
            .catch((e) => console.log("An exception has occurred while updating users and products: ", e));
        const reviewPromise = randReviews(quantity)
            .then(async (result) => {
                await Promise.all(result.map((review) => addReview(review)));
                console.log(`Added ${quantity} random reviews to users and products.`);
            })
            .catch((e) => {
                console.log("An exception has occurred while updating users and products: ", e);
            });
        await Promise.all([ratingsPromise, reviewPromise])
            .then((_) => {
                res.status(200).send(`Added ${quantity} random ratings and reviews to users and products.`);
            })
            .catch((e) => {
                res.status(400).send("An excpetion occurred when generating reviews/ratings: " + e);
            });
    });
}
