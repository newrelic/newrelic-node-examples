# OpenTelemetry Example PubSub App

This is an example app that uses the [New Relic agent](https://github.com/newrelic/node-newrelic) in the opentelemetry bridge mode to instrument GCP PubSub.

## Setup

### Setup GCP PubSub

In the [PubSub Getting Started guide](https://cloud.google.com/pubsub/docs/publish-receive-messages-client-library#before-you-begin), follow the steps in the "Before you begin" and "Create a topic and subscription" sections. `my-topic` is the default topic name and `my-sub` is the default subscription name (matches the guide), but this can be changed in `env-p.sample` and `env-s.sample` respectively.

### Run Example

Requirements:

+ Node.js >= 20.6.0

```sh
npm install
cp env-p.sample .env-p # Publisher env vars
cp env-s.sample .env-s # Subscriber env vars
# Fill out `NEW_RELIC_LICENSE_KEY` in .env-p and .env-s
npm run subscribe # Start subscriber
npm run publish # Run publisher a few times
```

## Exploring Telemetry

More to come later...
