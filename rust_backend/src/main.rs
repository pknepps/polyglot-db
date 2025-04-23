use std::{env::{self}, process};

use rust_backend::init_db;

/// # Main
/// This program is responsible for setting up and tearing down the polyglot system.
///
///**Authors:** Dalton Rogers, Preston Knepper
///**Version:** 2/12/25

/// Simply parses the command line args, ensures there are the expected number,
/// and calls the proper method (either setup or teardown).
#[tokio::main]
async fn main() {

    let backend_addr = env::var("BACKEND_ADDR");
    let db_addr = env::var("DB_ADDR");
    // let ip_addr = reqwest::get("icanhazip.com")
    //     .await
    //     .unwrap()
    //     .text()
    //     .await
    //     .unwrap();
    // let ip_addr = local_ip().unwrap();

    if backend_addr.is_err() {
        eprintln!("BACKEND_ADDR is not specified");
        process::exit(1);
    }
    if db_addr.is_err() {
        eprintln!("DB_ADDR is not specifie");
        process::exit(1);
    }
    let backend_addr = backend_addr.unwrap();
    let db_addr = db_addr.unwrap();

    let res = init_db(&backend_addr, &db_addr).await;

    if let Ok(success) = res {
        println!("Succesfully connected: {success}");
    } else {
        let err = res.err().unwrap();
        eprintln!("Error connecting to db: {err}");
        process::exit(1);
    }
}