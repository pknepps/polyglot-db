use crate::{Config, Setup, Teardown};

pub struct Unix;

impl Setup for Unix {
    fn setup(config: Config) -> std::io::Result<()> {
        Unix::setup_mongodb();
        Unix::setup_neo4j();
        Unix::setup_postgres();
        Ok(())
    }

    fn setup_mongodb() -> std::io::Result<std::process::Output> {
        todo!()
    }

    fn setup_neo4j() -> std::io::Result<std::process::Output> {
        todo!()
    }

    fn setup_postgres() -> std::io::Result<std::process::Output> {
        todo!()
    }
}

impl Teardown for Unix {
    fn teardown(config: Config) -> std::io::Result<()> {
        todo!()
    }

    fn teardown_mongodb() -> std::io::Result<std::process::Output> {
        todo!()
    }

    fn teardown_neo4j() -> std::io::Result<std::process::Output> {
        todo!()
    }

    fn teardown_postgres() -> std::io::Result<std::process::Output> {
        todo!()
    }
}