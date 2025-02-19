# OpenTelemetry Example Application

This is an example app that uses the [New Relic agent](https://github.com/newrelic/node-newrelic) in the opentelemetry bridge mode with `knex`, `express`, and `node-fetch`.

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

### Create Traffic

Here are a few routes you can use to create traffic on the application.

* `curl localhost:3000/projects/1`
* `curl localhost:3000/users`
* `curl localhost:3000/fetch`

More to come later...
