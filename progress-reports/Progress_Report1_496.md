# Progress Report: Sprint 1

## Preston Knepper, Dalton Rogers, and Kevin McCall

## CS496

## Dr. Holliday

## 1/14/2025

---

### Goals for the most recent sprint

- Do research about how to best to shard.
- Install and setup Redis.
- Set up docker containers via Rusts std::Command.
- Rust program will also handle teardown when complete.
- Work on the frontend.

---

### Activity Log

|        Name        | Date |  Time Spent  | Description of Activities                                                                                                            | Result of Activities                                                                                                       |
| :----------------: | :--: | :----------: | :----------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| Preston and Dalton | 2/5  | 1 hr 30 mins | Did some initial research to determine the best way to handle sharding.                                                              | Have a good starting point about how to approach the Rust backend.                                                         |
|      Preston       | 2/8  |     1 hr     | Set up Redis.                                                                                                                        | Redis is now installed and set up.                                                                                         |
|       Kevin        | 2/8  |   30 mins    | Researched Tailwind as UI Solutition                                                                                                 | Could explain taliwind to a baby now.                                                                                      |
|       Dalton       | 2/11 |    3 hrs     | Set up main.rs and got more familiar with how Rust works, along with the syntax.                                                     | Gained practice with Rust and am able to read in command line args.                                                        |
|      Preston       | 2/11 |    3 hrs     | Set up enums and worked on the ability to distribute and set up Docker containers using the Rust program.                            | Able to use Rust to set up Docker container on the hosts machine.                                                          |
|       Kevin        | 2/12 |    3 hrs     | Worked on creating the styles for the applications in tailwindcss. Additionally tried introducing a component library named Mantine. | Created a color theme to follow and styled many common components (buttons, navbar, panels).                               |
|       Dalton       | 2/13 |    2 hrs     | Worked on a method to connect to database and initialize the schema from the Rust program.                                           | The connection seems to be made, but the tables are not being created properly.                                            |
|      Preston       | 2/13 |    3 hrs     | Worked to find the bug for why the tables were not being created.                                                                    | The tables are properly created now.                                                                                       |
|       Kevin        | 2/13 |    3 hrs     | Decided on continuing with tailwindcss instead of mantine. Finished updating the look of the website                                 | Created Card and Modal reusable components. Finished styling the product page and the header. The website is pretty enough |
