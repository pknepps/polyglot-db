use anyhow::{anyhow, Context};
use reqwest::Client;
use serde_json::{json, Value};
use sqlx::{query, PgPool};

/// Will create the postgres schema for the Docker container.
///
/// **Param** password: The password for the Postgres user.
/// **Return**: Either nothing, or an error if one of the queries doesn't work.
async fn post_schema(password: &str) -> Result<(), sqlx::Error> {
    let database_url = format!("postgres://postgres:{}@localhost:5433/", password);

    println!("\nSetting PostgreSQL schema:");
    let pool = PgPool::connect(&database_url).await?;
    println!("Connected to Postgres...\n");

    // drop previous tables
    query("DROP TABLE IF EXISTS TRANSACTIONS;")
        .execute(&pool)
        .await?;
    query("DROP TABLE IF EXISTS PRODUCTS;")
        .execute(&pool)
        .await?;
    query("DROP TABLE IF EXISTS USERS;").execute(&pool).await?;
    // create necessary tables
    query(
        "CREATE TABLE USERS (
                    username VARCHAR(50) PRIMARY KEY,
                    first_name VARCHAR(50),
                    last_name VARCHAR(50)
        );",
    )
    .execute(&pool)
    .await?;
    query(
        "CREATE TABLE PRODUCTS (
                    product_id INT PRIMARY KEY,
                    price float(2),
                    name VARCHAR(255)
        );",
    )
    .execute(&pool)
    .await?;
    query(
        "CREATE TABLE TRANSACTIONS (
                    transaction_id INT PRIMARY KEY, 
                    username VARCHAR(50) REFERENCES USERS,
                    product_id INT REFERENCES PRODUCTS,
                    card_num BIGINT,
                    address_line VARCHAR(100),
                    city VARCHAR(35),
                    state CHAR(2),
                    zip INT
        );",
    )
    .execute(&pool)
    .await?;
    Ok(())
}

pub async fn init_db(backend_addr: &str, ip_addr: &str) -> Result<String, anyhow::Error> {
    let json_data = json!({
        "ipAddr": ip_addr
    });
    let backend_response  = Client::new()
        .post(format!("http://{backend_addr}:8000/api/add-db"))
        .json(&json_data)
        .send()
        .await
        .with_context(|| "Not able to connect to server")?;

    match backend_response.error_for_status_ref() {
        Ok(_) => (),
        Err(code) => return Err(anyhow!("Error response from backend {}", code)),
    }

    let backend_response: Value = serde_json::from_str(
        &backend_response
            .text()
            .await
            .with_context(|| "Unable to extract text")?,
    )
    .with_context(|| "unable to parse json")?;

    if let Some(error) = backend_response.get("error") {
        return Err(anyhow!(error.to_owned()));
    } else if let Some(success) = backend_response.get("success") {
        return Ok(success.to_string());
    }
    return Err(anyhow!("backend was poorly coded, no response or success"));
}
