# OpenTelemetry Example PubSub App

This is an example app that uses the [New Relic agent](https://github.com/newrelic/node-newrelic) in the OpenTelemetry bridge mode to instrument GCP Pub/Sub.

## Example App Setup

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

## Instrumenting your Application

If you already have a GCP Pub/Sub application that you would like to instrument with our agent's OpenTelemetry bridge, here are the steps that you need to do:

1. Install `newrelic` normally. Please refer to our [installation docs](https://docs.newrelic.com/docs/apm/agents/nodejs-agent/installation-configuration/install-nodejs-agent/) if you need help.
2. In your `newrelic.js` file, set the `opentelemetry_bridge` flag to `true` inside `exports.config`:
   ```javascript
   exports.config = {
        // ...
        feature_flag: {
            opentelemetry_bridge: true
        },
        // ...
   }
   ```
3. In every file that instantiates the `PubSub` class, give it the config of `enableOpenTelemetryTracing:true`.
   ```javascript
   const { PubSub } = require('@google-cloud/pubsub')
   const pubsubClient = new PubSub({ enableOpenTelemetryTracing: true })
   ```
4. Wrap the code that publishes messages in a background transaction. This is not necessary for the subscriber.
   ```javascript
   const newrelic = require('newrelic')
   // ...
   newrelic.startBackgroundTransaction('transaction name', async function handleTransaction() {
        const txn = newrelic.getTransaction()
        await publishMessage() // replace with your function
        txn.end()
   })
   ```
