use std::io::Result;

mod unix;
mod windows;
pub use crate::unix::Unix;
pub use crate::windows::Windows;

pub fn start(action: Action) {
    // checks what os is being used and calls the appropriate setup
    if cfg!(target_os = "windows") {
        match action {
            Action::Setup(perform_on) => Windows::setup(perform_on),
            Action::Teardown(perform_on) => Windows::teardown(perform_on),
        }
    } else {
        match action {
            Action::Setup(perform_on) => Unix::setup(perform_on),
            Action::Teardown(perform_on) => Unix::teardown(perform_on),
        }
    }
}

pub enum Action {
    Setup(PerformOn),
    Teardown(PerformOn),
}

pub enum PerformOn {
    All,
    Postgres,
    MongoDB,
    Neo4j,
}

pub trait Setup {
    fn setup(perform_on: PerformOn);
    fn setup_postgres() -> Result<()>;
    fn setup_mongodb() -> Result<()>;
    fn setup_neo4j() -> Result<()>;
}

pub trait Teardown {
    fn teardown(perform_on: PerformOn);
    fn teardown_postgres() -> Result<()>;
    fn teardown_mongodb() -> Result<()>;
    fn teardown_neo4j() -> Result<()>;
}