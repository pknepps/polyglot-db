# Progress Report: Sprint 2

## Preston Knepper, Dalton Rogers, and Kevin McCall

## CS496

## Dr. Holliday

## 3/7/2025

---

### Goals for the most recent sprint

- ***

### Activity Log

|        Name        | Date |   Time Spent   | Description of Activities                                                                                          | Result of Activities                                                                                                                                     |
| :----------------: | :--: | :------------: | :----------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Preston and Dalton | 2/5  |  1 hr 30 mins  | Did some initial research to determine the best way to handle sharding.                                            | Have a good starting point about how to approach the Rust backend.                                                                                       |
|       Kevin        | 2/21 |    3 hours     | Investigated existing sharding solutions for Postgres, MongoDB, Neo4J and Redis                                    | Gained a sense of direction of implementation and learned that a custom implementation is a valid solutions and would be better suited for our use case. |
| Kevin and Preston  | 2/26 |    2 hours     | Met at the MTC and set up the Redis database. Laid out plans and code architecture for routing shards using Redis. | Created the Redis database and attached it to our project.                                                                                               |
|       Kevin        | 3/3  |    2 hours     | Started filling out the code skeleton established on 2/26.                                                         | Rewrote many asynchronous methods to return promises correctly. Functions query which database to connect to before performing queries.                  |
|       Kevin        | 3/3  | 1 hour 30 mins | Rewrote the create.ts file to shard the postgres database.                                                         | The postgres database now considers all databases and routes new data to the least contended database.                                                   |
|       Kevin        | 3/4  |    30 mins     | Used Redis to handle synchronization between databases across networks.                                            | Redis handles race conditions through INCR command.                                                                                                      |
|       Kevin        | 3/5  |    2 hours     | Optimized the database connections to support hundreds of thousands of generated products.                         | Program no longer crashes due to running out of postgres connections.                                                                                    |
