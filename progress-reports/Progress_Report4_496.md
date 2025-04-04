# Progress Report: Sprint 3

## Preston Knepper, Dalton Rogers, and Kevin McCall

## CS496

## Dr. Holliday

## 4/4/2025

---

### Goals for the most recent sprint

- Complete poster revisions and turn it in.
- Flesh out front-end for poster session.
- Implement redis visualization.

### Activity Log

|       Name        | Date |   Time Spent   | Description of Activities                                                                                                                                                      | Result of Activities                                                                                                                                                               |
| :---------------: | :--: | :------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Preston | 3/26 | 1 hour | Added clickable recomendations to frontend product cards | We now have a fully complete and functional product page|
| Preston and Kevin | 3/26 |    3 hours     | Started refactoring frontend to follow nextjs best practices.                                                                                                                  | Routing is now determined through the App router, instead of ad-hoc react state. Additionally, selecting a single product works through clicking and directly throug the route url |
|       Kevin       | 3/27 |   30 minutes   | Changed homepage view to display less information for easier scrolling and less data intensive.                                                                                | Frontend is easier to navigate on the left side.                                                                                                                                   |
|       Kevin       | 3/27 |     1 hour     | Started working on the 3 column layout for the poster                                                                                                                          | Starting point for revamping our poster.                                                                                                                                           |
| Kevin and Preston | 3/28 |     2 hour     | Continued fleshing out poster                                                                                                                                                  | Draft 1 sent out                                                                                                                                                                   |
| Kevin and Preston | 3/29 |     1 hour     | Further adjusted poster                                                                                                                                                        | Draft 2 sent out                                                                                                                                                                   |
| Kevin and Preston | 3/30 |     4 hour     | Finished major refactor of frontend to support nextjs server side components. Additionally added parallel routes for rightside.                                                | Data is now fetched in the backend and passed to the frontend instead of all data being passed to frontend and rendered using js.                                                  |
| Kevin and Preston | 4/2  | 1 hour 30 mins | Did research about cockroachDB, decided to use yugabytedb instead. Began work connecting Yugabyte to backend.                                                                  | New branch yugabyte containing docker code to replace postgres.                                                                                                                    |
| Preston | 4/2 | 8 hours | merged frontend branch and sharding branch with main branch (yes it took that long) | Our project is now connected and working with all 4 databases and an working (but not implemented) sharding algorithm |
| Kevin and Preston | 4/3  |       2        | Finished replacing postgres with yugabyte on rust script and connected it to backend. Added redis to rust docker script. Fixed configuration for all databases in rust script. | Yugabyte is now ready to replace postgres.                                                                                                                                         |
| Preston | 4/3 | 3 hours 30 minutes | Added redis table to the frontend | We can now visualize redis schema data on the frontend |
| Preston | 3/22 | 15 minutes | Worked on poster ||
| Preston | 3/23 | 15 minutes | Worked on poster ||
| Preston | 3/24 | 30 minutes | Worked on poster, completing the experiences and reflections section | We now had a final format of the poster to iterate on |
| Preston | 3/28 | 15 minutes | Worked on poster ||
| Preston | 3/30 | 30 minutes | Made my final adjustments to poster | had a complete poster that just needed a few feedback changes |
| Dalton | 3/28 | 1 hr 30 minutes | Added the schema section to the poster. | The poster now has the structure of our databases visualized. |
| Dalton | 3/29 | 45 minutes | Made revisions to the neo4j graph in the schema section and tested out different fonts. | The schema section is complete. |
| Dalton | 3/31 | 30 minutes | Made the final corrections to the poster and submitted. | The poster is complete.|
| Dalton | 4/1 | 30 minutes | Implemented possible helper methods for the search bar and finding products. | This did not work very well, decided to go back to a context. |
| Dalton | 4/2 | 1 hour | Fixed the search bar using contexts. | The search bar is back to functional. |
| Dalton | 4/3 | 3 hours | Worked on styling for the add data page, and got adding products working successfully. | We can now add products completely from the frontend. |
| Dalton | 4/3 | 2 hours | Implemented the ability to add users as well. | We can now add users from the frontend. |