-- Creates POSTGRES tables
-- @author Preston Knepper
-- @date 9/9/24
DROP TABLE TRANSACTIONS;
DROP TABLE PRODUCTS;
DROP TABLE USERS;

CREATE TABLE USERS (
    username VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50)
);

CREATE TABLE PRODUCTS (
    product_id INT PRIMARY KEY,
    price float(2),
    name VARCHAR(255)
);

CREATE TABLE TRANSACTIONS (
    transaction_id INT PRIMARY KEY, 
    username VARCHAR(50) REFERENCES USERS,
    product_id INT REFERENCES PRODUCTS,
    card_num BIGINT,
    address_line VARCHAR(100),
    city VARCHAR(35),
    state CHAR(2),
    zip INT
);
