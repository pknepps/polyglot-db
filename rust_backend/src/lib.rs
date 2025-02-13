use std::io::Result;
mod unix;
mod windows;
pub use crate::unix::Unix;
pub use crate::windows::Windows;
/// 
/// This module is responsible for performing either the setup or the teardown depending 
/// on the user input.
/// Author Preston Knepper
/// Version 2/12/25
/// 

///
/// This function will determine the target operating system that the setup and
/// teardown will be performed on. Either Windows or Unix. 
/// 
pub fn start(action: Action) {
    // checks what os is being used and calls the appropriate setup
    if cfg!(target_os = "windows") {
        match action {
            Action::Setup(perform_on) => Windows::setup(perform_on),
            Action::Teardown(perform_on) => Windows::teardown(perform_on),
        }
    } else { // this does the unix setup
        match action {
            Action::Setup(perform_on) => Unix::setup(perform_on),
            Action::Teardown(perform_on) => Unix::teardown(perform_on),
        }
    }
}

///
/// The Action enum is responsible for classifying what we are performing, in this
/// case either Setup or Teardown. PerformOn indicates which systems the Action will
/// be performed on.
/// 
pub enum Action {
    Setup(PerformOn),
    Teardown(PerformOn),
}

///
/// The PerformOn enum is responsible for classifying the database system we will be
/// performing the Action on. Can either be all of them, or one of them at a time.
/// 
pub enum PerformOn {
    All,
    Postgres,
    MongoDB,
    Neo4j,
}

///
/// Acts like an Interface for Setup, highlighting what needs to be implemented
/// by Setup. This includes methods for setting up all the containers, or just one
/// specific container.
/// 
pub trait Setup {
    fn setup(perform_on: PerformOn);
    fn setup_postgres() -> Result<()>;
    fn setup_mongodb() -> Result<()>;
    fn setup_neo4j() -> Result<()>;
}

/// 
/// Acts like an Interface for Teardown, highlighting what needs to be 
/// implemented by Teardown. This includes methods for tearing down all
/// of the containers, or just one specific container.
/// 
pub trait Teardown {
    fn teardown(perform_on: PerformOn);
    fn teardown_postgres() -> Result<()>;
    fn teardown_mongodb() -> Result<()>;
    fn teardown_neo4j() -> Result<()>;
}