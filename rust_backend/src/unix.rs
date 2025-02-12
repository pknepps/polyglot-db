use crate::{PerformOn, Setup, Teardown};
use std::process::Command;

pub struct Unix;

impl Setup for Unix {
    fn setup(perform_on: PerformOn) {
        if let Err(error) = match perform_on{
            PerformOn::All => {
                Unix::setup_mongodb();
                Unix::setup_neo4j();
                Unix::setup_postgres();
                Ok(())
            },
            PerformOn::MongoDB => {
                Unix::setup_mongodb()
            },
            PerformOn::Neo4j => {
                Unix::setup_neo4j()
            },
            PerformOn::Postgres => {
                Unix::setup_postgres()
            },
        } {
            println!("{error:?}");
        }
    }

    fn setup_mongodb() -> std::io::Result<()> {
        todo!()
    }

    fn setup_neo4j() -> std::io::Result<()> {
        let output = Command::new("sh")
            .arg("-c")
            .arg(
                "docker run \
                --publish=7474:7474 \
                --publish=7687:7687 \
                --env NEO4J_AUTH=neo4j/jojygjojs \
                neo4j:5.24.1 \
                --detach"
            ).output()?;
        Ok(())
    }

    fn setup_postgres() -> std::io::Result<()> {
        todo!();
        Ok(())
    }
}

impl Teardown for Unix {
    fn teardown(perform_on: PerformOn) {
        if let Err(error) = match perform_on{
            PerformOn::All => {
                Unix::teardown_mongodb();
                Unix::teardown_neo4j();
                Unix::teardown_postgres();
                Ok(())
            },
            PerformOn::MongoDB => {
                Unix::teardown_mongodb()
            },
            PerformOn::Neo4j => {
                Unix::teardown_neo4j()
            },
            PerformOn::Postgres => {
                Unix::teardown_postgres()
            },
        } {
            println!("{error:?}");
        }
    }

    fn teardown_mongodb() -> std::io::Result<()> {
        todo!();
        Ok(())
    }

    fn teardown_neo4j() -> std::io::Result<()> {
        todo!();
        Ok(())
    }

    fn teardown_postgres() -> std::io::Result<()> {
        todo!();
        Ok(())
    }
}