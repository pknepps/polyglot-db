use std::process::Command;

mod setup;
mod teardown;
pub use crate::setup::setup;
pub use crate::teardown::teardown;

pub enum Action {
    Setup(PerformOn),
    Teardown(PerformOn),
}

pub enum PerformOn {
    All,
    Postgres,
    MongoDB,
    Neo4j,
}

#[derive(Clone, Copy)]
enum OS {
    Windows,
    Unix,
}

pub fn start(action: Action) {
    // checks what os is being used and calls the appropriate setup
    if cfg!(target_os = "windows") {
        match action {
            Action::Setup(perform_on) => setup(perform_on, OS::Windows),
            Action::Teardown(perform_on) => teardown(perform_on, OS::Windows),
        }
    } else {
        match action {
            Action::Setup(perform_on) => setup(perform_on, OS::Unix),
            Action::Teardown(perform_on) => teardown(perform_on, OS::Unix),
        }
    }
}

fn run_command(command: &str, os: OS) -> std::io::Result<()> {
    let output = match os {
        OS::Windows => Command::new("cmd")
            .arg("/C")
            .arg(command)
            .output()?,
        OS::Unix => Command::new("sh")
            .arg("-c")
            .arg(command)
            .output()?,
    };
    println!("{}", String::from_utf8_lossy(&output.stdout));
    eprintln!("{}", String::from_utf8_lossy(&output.stderr));
    Ok(())
}