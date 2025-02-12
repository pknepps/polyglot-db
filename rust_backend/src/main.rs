use std::process::Command;
/*
This program is responsible for setting up the polyglot system.

@author Dalton Rogers, Preston Knepper
@version
*/

fn main() {
    // checks what os is being used and calls the appropriate setup
    if cfg!(target_os = "windows") {
        windows_setup();
    } else {
        linux_setup();
    }
}

fn windows_setup(){
    let status = Command::new("runas")
}

fn linux_setup(){
    let status = Command::new("sudo");
}