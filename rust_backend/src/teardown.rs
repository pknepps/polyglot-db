use crate::{PerformOn, run_command, OS};

pub fn teardown(perform_on: PerformOn, os: OS) {
    if let Err(error) = match perform_on{
        PerformOn::All => {
            teardown(PerformOn::MongoDB, os);
            teardown(PerformOn::Neo4j, os);
            teardown(PerformOn::Postgres, os);
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
    println!("Tearing down MongoDB container...");
    run_command("docker stop polyglot-mongodb", os)?;
    run_command("docker rm polyglot-mongodb", os)?;
    Ok(())
}

fn neo4j(os: OS) -> std::io::Result<()> {
    println!("Tearing down Neo4j container...");
    run_command("docker stop polyglot-neo4j", os)?;
    run_command("docker rm polyglot-neo4j", os)?;
    Ok(())
}

fn postgres(os: OS) -> std::io::Result<()> {
    println!("Tearing down PostgreSQL container...");
    run_command("docker stop polyglot-postgres", os)?;
    run_command("docker rm polyglot-postgres", os)?;
    Ok(())
}
