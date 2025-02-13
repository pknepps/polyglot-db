use crate::{PerformOn, run_command, OS};

/// #Teardown
/// This module does either teardown for all of the database systems or will
/// teardown just one of the systems.
/// 
/// **Author**: Preston Knepper
/// **Version**: 2/12/25

/// Looks at what database system will be having the command peformed on it. 
/// Then calls the appropriate teardown.
/// 
/// **Param** perform_on: The databse systems that will be torndown.
/// **Param** os: The operating system of the user.
pub fn teardown(perform_on: PerformOn, os: OS) {
    if let Err(error) = match perform_on{
        // teardown all databases
        PerformOn::All => {
            teardown(PerformOn::MongoDB, os);
            teardown(PerformOn::Neo4j, os);
            teardown(PerformOn::Postgres, os);
            Ok(())
        },
        // teardown mongodb
        PerformOn::MongoDB => {
            mongodb(os)
        },
        // teardown neo4j
        PerformOn::Neo4j => {
            neo4j(os)
        },
        // teardown postgres
        PerformOn::Postgres => {
            postgres(os)
        },
    } {
        // print an error if anything goes wrong
        println!("{error:?}");
    }
}

/// Will teardown the mongodb database system on the users device depending on
/// their operating system.
/// 
/// **Param** os: The operating system of the user.
/// **Return**: Either nothing if all goes well, or an error which gets thrown.
fn mongodb(os: OS) -> std::io::Result<()> {
    println!("Tearing down MongoDB container...");
    run_command("docker stop polyglot-mongodb", os)?;
    run_command("docker rm polyglot-mongodb", os)?;
    Ok(())
}

/// Will teardown the neo4j database system on the users device depending on
/// their operating system.
/// 
/// **Param** os: The operating system of the user.
/// **Return**: Either nothing if all goes well, or an error which gets thrown.
fn neo4j(os: OS) -> std::io::Result<()> {
    println!("Tearing down Neo4j container...");
    run_command("docker stop polyglot-neo4j", os)?;
    run_command("docker rm polyglot-neo4j", os)?;
    Ok(())
}

/// Will teardown the postgres database system on the users device depending on
/// their operating system.
/// 
/// **Param** os: The operating system of the user.
/// **Return**: Either nothing if all goes well, or an error which gets thrown.
fn postgres(os: OS) -> std::io::Result<()> {
    println!("Tearing down PostgreSQL container...");
    run_command("docker stop polyglot-postgres", os)?;
    run_command("docker rm polyglot-postgres", os)?;
    Ok(())
}
