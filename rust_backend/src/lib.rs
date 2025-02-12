use std::io::Result;
use std::process::Output;

mod unix;
mod windows;
pub use crate::unix::Unix;
pub use crate::windows::Windows;

pub fn start(action: Action) {
    // checks what os is being used and calls the appropriate setup
    if cfg!(target_os = "windows") {
        Windows::setup_postgres();
        todo!("Add windows setup")
    } else {
        todo!("Add unix setup")
    }
}

pub enum Action {
    Setup(Config),
    Teardown(Config),
}

pub struct Config {
    perform_on_postgres: bool,
    perform_on_mongodb: bool,
    perform_on_neo4j: bool,
}

impl Default for Config {
    fn default() -> Self {
        Config {
            perform_on_postgres: true,
            perform_on_mongodb: true,
            perform_on_neo4j: true,
        }
    }
}

impl Config {
    fn new(perform_on_postgres: bool, perform_on_mongodb: bool, perform_on_neo4j: bool) -> Self {
        Config {
            perform_on_postgres,
            perform_on_mongodb,
            perform_on_neo4j,
        }
    }
}

pub trait Setup {
    fn setup(config: Config) -> Result<()>;
    fn setup_postgres() -> Result<Output>;
    fn setup_mongodb() -> Result<Output>;
    fn setup_neo4j() -> Result<Output>;
}

pub trait Teardown {
    fn teardown(config: Config) -> Result<()>;
    fn teardown_postgres() -> Result<Output>;
    fn teardown_mongodb() -> Result<Output>;
    fn teardown_neo4j() -> Result<Output>;
}