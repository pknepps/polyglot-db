use std::process;

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
    let res = init_db().await;

    if let Ok(success) = res {
        println!("Succesfully connected: {success}");
    } else {
        let err = res.err().unwrap();
        eprintln!("Error connecting to db: {err}");
        process::exit(1);
    }
}