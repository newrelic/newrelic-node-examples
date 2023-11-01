# ESM Logs in Context
This utility was designed to generate logs for winston or pino.  It can be used to do performance testing of the application logging in agent.

## Getting Started

**Note**: You must have a New Relic license key.

### Set environment variable values

Edit the `NEW_RELIC_LICENSE_KEY` value in `env.example`.

You have the option of changing the following environment variables, if you'd like to rename the application or adjust the log level of the New Relic Node Agent. 
`NEW_RELIC_APP_NAME=logs-in-context-esm-example` 
`NEW_RELIC_LOG_LEVEL=info` 

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
