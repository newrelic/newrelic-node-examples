# OpenTelemetry Example AMQP Application

This is an example app that uses the [New Relic agent](https://github.com/newrelic/node-newrelic) in the opentelemetry bridge mode with AMQP (`rabbitmq`).

## Setup

**Note**: This is used to demonstrate behavior between the New Relic Node.js agent in opentelemetry bridge.

Requirements:

+ Node.js >= 20.6.0

```sh
npm install
cp env-p.sample .env-p # Producer env vars
cp env-c.sample .env-c # Consumer env vars
# Fill out `NEW_RELIC_LICENSE_KEY`
docker compose up -d
npm run start # Start consumer
npm run produce # Run producer a few times
```

## Exploring Telemetry

More to come later...
