# ESM Logs in Context
This utility was designed to generate logs for winston or pino.  It can be used to do performance testing of the application log forwarding in agent.

## Getting Started

**Note**: You must have a New Relic license key.

### Set environment variable values

```sh
cp env.example .env
```

Edit the `NEW_RELIC_LICENSE_KEY` and `NEW_RELIC_APP_NAME` values in `.env`, as well as the `NEW_RELIC_LOG_LEVEL` if you prefer more detailed logs.

```sh
docker compose up --build
```

In another terminal, you can generate server responses by executing

```sh
curl http://localhost:3000/ 
```
or 
```sh
wget -o stdout http://localhost:3000/ 
```
Look for your logs in your application in NR One by clicking on the Logs link. You can compare the value returned from the server to the value logged in NR One.
