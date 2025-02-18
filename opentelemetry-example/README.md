# OpenTelemetry Example Aplication 

This is an example app that uses the [New Relic agent](https://github.com/newrelic/node-newrelic) in the opentelemetry bridge mode.


## Setup
**Note**: This is used to demonstrate behavior between the New Relic Node.js agent in opentelemetry bridge. 

```sh
npm install
cp env.sample .env
# Fill out `NEW_RELIC_LICENSE_KEY`
docker compose up -d
npm run db:migrate
npm run db:seed
npm start
```

## Exploring Telemetry
More to come later...
