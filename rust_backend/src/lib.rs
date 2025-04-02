use std::process::Command;
mod setup;
mod teardown;
pub use crate::setup::setup;
pub use crate::teardown::teardown;

/// #Lib
/// This module is where we define our Enums used throughout the program, such
/// as Action, PerformOn, and OS. We also have a start method which checks what
/// the user's OS is and run_command is responsible for running the various
/// Docker commands.
///
/// **Author**: Preston Knepper
/// **Version**: 2/12/25

/// The Action enum is responsible for classifying what we are performing, in
/// this case either Setup or Teardown. PerformOn indicates which systems the
/// Action will be performed on.
pub enum Action {
    Setup(PerformOn),
    Teardown(PerformOn),
}

/// The PerformOn enum is responsible for classifying the database system we
/// will be performing the Action on. Can either be all of them, or one of
/// them at a time.
pub enum PerformOn {
    All,
    Postgres,
    MongoDB,
    Neo4j,
}

/// The OS enum is used to classify the type of Operating System being used. It
/// implements both Clone and Copy traits. The OS has either a Windows or Unix
/// variant.
#[derive(Clone, Copy)]
pub enum OS {
    Windows,
    Unix,
}

/// This will determine the OS of the user and call the proper setup or
/// teardown.
///
/// **Param** action: Either Setup or Teardown.
pub fn start(action: Action) {
    // checks what os is being used and calls the appropriate setup
    if cfg!(target_os = "windows") {
        match action {
            Action::Setup(perform_on) => setup(perform_on, OS::Windows),
            Action::Teardown(perform_on) => teardown(perform_on, OS::Windows),
        }
    } else {
        // setup and teardown for unix
        match action {
            Action::Setup(perform_on) => setup(perform_on, OS::Unix),
            Action::Teardown(perform_on) => teardown(perform_on, OS::Unix),
        }
    }
}

/// Takes a string and a operating system, uses this information to run the
/// command line for the correct operating system.
///
/// **Param** command: The command for the command line.
/// **Param** os: The OS variant.
/// **Return**: Will return nothing if all goes well, otherwise throws the
/// output.
fn run_command(command: &str, os: OS) -> std::io::Result<()> {
    let _child = match os {
        OS::Windows => Command::new("cmd").arg("/C").arg(command).status()?,
        OS::Unix => Command::new("sh").arg("-c").arg(command).status()?,
    };
    Ok(())
}
