use crate::{PerformOn, run_command, OS};

/// #Setup
/// This module does either setup for all of the database systems or will
/// setup just one of the systems.
/// 
/// **Author**: Preston Knepper
/// **Version**: 2/12/25

/// Looks at what database system will be having the command peformed on it. 
/// Then calls the appropriate setup.
/// 
/// **Param** perform_on: The databse systems that will be setup.
/// **Param** os: The operating system of the user.
pub fn setup(perform_on: PerformOn, os: OS) {
    if let Err(error) = match perform_on{
        // setup all databases
        PerformOn::All => {
            setup(PerformOn::MongoDB, os);
            setup(PerformOn::Neo4j, os);
            setup(PerformOn::Postgres, os);
            Ok(())
        },
        // setup mongodb
        PerformOn::MongoDB => {
            mongodb(os)
        },
        // setup neo4j
        PerformOn::Neo4j => {
            neo4j(os)
        },
        // setup postgres
        PerformOn::Postgres => {
            postgres(os)
        },
    } { // if something goes wrong, print the error
        println!("{error:?}");
    }
}

/// Will setup the mongodb database system on the users device depending on
/// their operating system.
/// 
/// **Param** os: The operating system of the user.
/// **Result**: Either nothing if all goes well, or an error which gets thrown.
fn mongodb(os: OS) -> std::io::Result<()> {
    println!("Creating MongoDB container...");
    // command to pull the docker container
    run_command("docker pull mongodb/mongodb-community-server:latest", os)?;
    // command to run the docker container
    run_command(
        "docker run \
            --name polyglot-mongodb \
            -p 27017:27017 \
            -d \
            mongodb/mongodb-community-server:latest"
    , os)?;
    Ok(())
}

/// Will setup the neo4j database system on the users device depending on their
/// operating system.
/// 
/// **Param** os: The operating system of the user.
/// **Return**: Either nothing if all goes well, or an error which gets thrown.
fn neo4j(os: OS) -> std::io::Result<()> {
    // get the password
    let password = include_str!("../../backend/app/NEO4J_PASSWORD");
    println!("Creating Neo4j container...");
    // the command to run the neo4j container
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

/// Will setup the postgres database system on the users device depending on 
/// their operating system.
/// 
/// **Param** os: The operating system of the user.
/// **Return**: Either nothing if all goes well, or an error which gets thrown.
fn postgres(os: OS) -> std::io::Result<()> {
    // gets the password
    let password = include_str!("../../backend/app/POSTGRES_PASSWORD");
    println!("Creating PostgreSQL container...");
    // commmand to run the postgres container
    run_command(&format!(
        "docker run \
            --name=polyglot-postgres \
            -e POSTGRES_PASSWORD={password} \
            -d \
            postgres"
    ), os)?;
    Ok(())
}
