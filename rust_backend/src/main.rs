use std::process;
use std::env;
use rust_backend::{start, Config, Action};
/*
This program is responsible for setting up and tearing down the polyglot system.

@author Dalton Rogers, Preston Knepper
@version 2/12/25
*/

///
/// Simply parses the command line args, ensures there are the expected number,
/// and calls the proper method (either setup or teardown).
/// 
fn main() {
    // get the args
    let args: Vec<String> = env::args().collect();

    // make sure the proper input is provided
    if args.len() < 2 || args.len() > 5 {
        eprintln!("Usage: {} <'setup'/'teardown'> ['postgres'] 
                    ['mongodb'] ['neo4j']", args[0]);
        process::exit(1);
    } 

    // creates a config based on input, either setup all or just one
    let config = if args.len() == 2 {
        Config::default()
    } else {
        match args[2].as_str() {
            "postgres" => Config::new(true, false, false),
            "mongodb" => Config::new(false, true, false),
            "neo4j" => Config::new(false, false, true),
            _ => panic!("Invalid Argument: Expected optional [postgres | mongodb | neo4j]")
        }
    };

    // determines whether to call the setup or teardown
    match args[1].as_str() {
        "setup" => start(Action::Setup(config)),
        "teardown" => start(Action::Teardown(config)),
        _ => {
            panic!("Invalid Argument: Expecting (setup | teardown)");
        }
    }
}