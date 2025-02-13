use crate::{PerformOn, run_command, OS};

pub fn setup(perform_on: PerformOn, os: OS) {
    if let Err(error) = match perform_on{
        PerformOn::All => {
            setup(PerformOn::MongoDB, os);
            setup(PerformOn::Neo4j, os);
            setup(PerformOn::Postgres, os);
            Ok(())
        },
        PerformOn::MongoDB => {
            mongodb(os)
        },
        PerformOn::Neo4j => {
            neo4j(os)
        },
        PerformOn::Postgres => {
            postgres(os)
        },
    } {
        println!("{error:?}");
    }
}

fn mongodb(os: OS) -> std::io::Result<()> {
    println!("Creating MongoDB container...");
    run_command("docker pull mongodb/mongodb-community-server:latest", os)?;
    run_command(
        "docker run \
            --name polyglot-mongodb \
            -p 27017:27017 \
            -d \
            mongodb/mongodb-community-server:latest"
    , os)?;
    Ok(())
}

fn neo4j(os: OS) -> std::io::Result<()> {
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
    ), os)?;
    Ok(())
}

fn postgres(os: OS) -> std::io::Result<()> {
    let password = include_str!("../../backend/app/POSTGRES_PASSWORD");
    println!("Creating PostgreSQL container...");
    run_command(&format!(
        "docker run \
            --name=polyglot-postgres \
            -e POSTGRES_PASSWORD={password} \
            -d \
            postgres"
    ), os)?;
    Ok(())
}
