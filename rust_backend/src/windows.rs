use crate::{PerformOn, Setup, Teardown};

pub struct Windows;

impl Setup for Windows {
    fn setup(perform_on: PerformOn) {
        todo!()
    }

    fn setup_mongodb() -> std::io::Result<()> {
        todo!()
    }

    fn setup_neo4j() -> std::io::Result<()> {
        todo!()
    }

    fn setup_postgres() -> std::io::Result<()> {
        todo!()
    }
}

impl Teardown for Windows {
    fn teardown(perform_on: PerformOn) {
        todo!()
    }

    fn teardown_mongodb() -> std::io::Result<()> {
        todo!()
    }

    fn teardown_neo4j() -> std::io::Result<()> {
        todo!()
    }

    fn teardown_postgres() -> std::io::Result<()> {
        todo!()
    }
}