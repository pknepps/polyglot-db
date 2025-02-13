use crate::{PerformOn, Setup, Teardown};
use std::process::Command;

pub struct Unix;

impl Setup for Unix {
    fn setup(perform_on: PerformOn) {
        if let Err(error) = match perform_on{
            PerformOn::All => {
                Unix::setup(PerformOn::MongoDB);
                Unix::setup(PerformOn::Neo4j);
                Unix::setup(PerformOn::Postgres);
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
        println!("Creating MongoDB container...");
        run_command("docker pull mongodb/mongodb-community-server:latest")?;
        run_command(
            "docker run \
                --name polyglot-mongodb \
                -p 27017:27017 \
                -d \
                mongodb/mongodb-community-server:latest"
        )?;
        Ok(())
    }

    fn setup_neo4j() -> std::io::Result<()> {
        let password = include_str!("../../backend/app/NEO4J_PASSWORD");
        println!("Creating Neo4j container...");
        run_command(&format!(
            "docker run \
                --name=polyglot-neo4j \
                --publish=7474:7474 \
                --publish=7687:7687 \
                --env NEO4J_AUTH=neo4j/{password} \
                -d \
                neo4j:5.24.1"
        ))?;
        Ok(())
    }

    fn setup_postgres() -> std::io::Result<()> {
        let password = include_str!("../../backend/app/POSTGRES_PASSWORD");
        println!("Creating PostgreSQL container...");
        run_command(&format!(
            "docker run \
                --name=polyglot-postgres \
                -e POSTGRES_PASSWORD={password} \
                -d \
                postgres"
        ))?;
        Ok(())
    }
}

impl Teardown for Unix {
    fn teardown(perform_on: PerformOn) {
        if let Err(error) = match perform_on{
            PerformOn::All => {
                Unix::teardown(PerformOn::MongoDB);
                Unix::teardown(PerformOn::Neo4j);
                Unix::teardown(PerformOn::Postgres);
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
        println!("Tearing down MongoDB container...");
        run_command("docker stop polyglot-mongodb")?;
        run_command("docker rm polyglot-mongodb")?;
        Ok(())
    }

    fn teardown_neo4j() -> std::io::Result<()> {
        println!("Tearing down Neo4j container...");
        run_command("docker stop polyglot-neo4j")?;
        run_command("docker rm polyglot-neo4j")?;
        Ok(())
    }

    fn teardown_postgres() -> std::io::Result<()> {
        println!("Tearing down PostgreSQL container...");
        run_command("docker stop polyglot-postgres")?;
        run_command("docker rm polyglot-postgres")?;
        Ok(())
    }
}

fn run_command(command: &str) -> std::io::Result<()> {
    let output = Command::new("sh")
        .arg("-c")
        .arg(command)
        .output()?;
    println!("{}", String::from_utf8_lossy(&output.stdout));
    eprintln!("{}", String::from_utf8_lossy(&output.stderr));
    Ok(())
}