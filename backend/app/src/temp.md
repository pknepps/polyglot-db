plan to add "sharding"
1. Add new route in api (backend api.ts, shard.ts) to connect database
    - Make sure that arbitrary people can't connect to our database
    - Make sure the same database cannot connect more than once
2. When creating a new instance of the backend, it will take (as an environment variable) the ip address or hostname of a backend to connect to
3. The script will call the new api route and that will send the ip address or hostname of the docker to the backend
4. The backend will then add the ip address it gets from the api call to the map
5. it just works