# OpenTelemetry Example AMQP Application

This is an example app that uses the [New Relic agent](https://github.com/newrelic/node-newrelic) in the opentelemetry bridge mode with AMQP (`rabbitmq`).

## Setup

**Note**: This is used to demonstrate behavior between the New Relic Node.js agent in opentelemetry bridge.

```sh
npm install
cp env.sample .env
# Fill out `NEW_RELIC_LICENSE_KEY`
docker compose up -d
npm run start
npm run produce # Run several times for more traffic
```

## Exploring Telemetry

More to come later...
