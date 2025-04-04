# Progress Report: Sprint 3

## Preston Knepper, Dalton Rogers, and Kevin McCall

## CS496

## Dr. Holliday

## 4/3/2025

---

### Goals for the most recent sprint

- Complete poster revisions and turn it in.
- Flesh out front-end for poster session.
- Implement redis visualization
-

### Activity Log

|       Name        | Date |   Time Spent   | Description of Activities                                                                                                                                                      | Result of Activities                                                                                                                                                               |
| :---------------: | :--: | :------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Preston and Kevin | 3/26 |    3 hours     | Started refactoring frontend to follow nextjs best practices.                                                                                                                  | Routing is now determined through the App router, instead of ad-hoc react state. Additionally, selecting a single product works through clicking and directly throug the route url |
|       Kevin       | 3/27 |   30 minutes   | Changed homepage view to display less information for easier scrolling and less data intensive.                                                                                | Frontend is easier to navigate on the left side.                                                                                                                                   |
|       Kevin       | 3/27 |     1 hour     | Started working on the 3 column layout for the poster                                                                                                                          | Starting point for revamping our poster.                                                                                                                                           |
| Kevin and Preston | 3/28 |     2 hour     | Continued fleshing out poster                                                                                                                                                  | Draft 1 sent out                                                                                                                                                                   |
| Kevin and Preston | 3/29 |     1 hour     | Further adjusted poster                                                                                                                                                        | Draft 2 sent out                                                                                                                                                                   |
| Kevin and Preston | 3/30 |     4 hour     | Finished major refactor of frontend to support nextjs server side components. Additionally added parallel routes for rightside.                                                | Data is now fetched in the backend and passed to the frontend instead of all data being passed to frontend and rendered using js.                                                  |
| Kevin and Preston | 4/2  | 1 hour 30 mins | Did research about cockroachDB, decided to use yugabytedb instead. Began work connecting Yugabyte to backend.                                                                  | New branch yugabyte containing docker code to replace postgres.                                                                                                                    |
| Kevin and Preston | 4/3  |       2        | Finished replacing postgres with yugabyte on rust script and connected it to backend. Added redis to rust docker script. Fixed configuration for all databases in rust script. | Yugabyte is now ready to replace postgres.                                                                                                                                         |
