use crate::{Config, Setup, Teardown};

pub struct Windows;

impl Setup for Windows {
    fn setup(config: Config) -> std::io::Result<()> {
        todo!()
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

impl Teardown for Windows {
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