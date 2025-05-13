# Polyglot-DB
Our captsonse project for our computer science degrees. This was completed over the course of our last 2 semesters of university.

Polyglot-DB is an example implementation of a multi-database application. The four databases used here are:
1. PostgreSQL
   - Relational database
   - Used to store permanent sales data
3. MongoDB
   - Document database
   - Used to store webpage data
5. Neo4j
   - Graph database
   - Used to handle the recommendation algorithm
7. Redis
   - Key-value database
   - Used to handle the sharding algorithm for MongoDB
   - Used to store cached webpage data

Each of these work together to form a mock ecommerce application (i.e. Amazon), which demonstrates how multiple databases can work together to overcome obstacles that a single database would have.
