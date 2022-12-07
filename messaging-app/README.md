# Example instrumentation of a messaging application

This is an example app that uses the `newrelic.instrumentMessages` [API function](https://docs.newrelic.com/docs/apm/agents/nodejs-agent/api-guides/nodejs-agent-api/#instrumentMessages) and associated [messaging shim API](https://newrelic.github.io/node-newrelic/docs/MessageShim.html) to instrument a toy messaging library called Nifty Messages. This sample instrumentation is an implementation of the [New Relic messaging instrumentation tutorial](http://newrelic.github.io/node-newrelic/docs/tutorial-Messaging-Simple.html).

## Getting started

1. Clone or fork, this repository,

2. Go into this subdirectory,

``` sh
cd newrelic-node-examples/messaging-app
```

3. Install dependencies and run application

```sh
npm ci
PORT=3000 NEW_RELIC_LICENSE_KEY=<Your New Relic License Key> npm start
```

This will start an Express app tied to a local-only toy messaging application at `http://localhost:3000`, with three endpoints: `/` for getting messages, `/publish` with a GET query parameter `msg` for publishing a message, and `/subscribe` for starting a message subscription to the `main` queue.

4. Make requests to the application

```sh
# Publish two messages
curl 'http://localhost:3000/publish?msg=hello'
curl 'http://localhost:3000/publish?msg=goodbye'

# Fetch the two messages
curl 'http://localhost:3000/'
curl 'http://localhost:3000/'

# Subscribe to get all messages
curl 'http://localhost:3000/subscribe'

# Publish two more
curl 'http://localhost:3000/publish?msg=hello+again'
curl 'http://localhost:3000/publish?msg=goodbye+again'

# Get the messages processed by the subscription
curl 'http://localhost:3000/'
```

5. Navigate to [New Relic One](https://one.newrelic.com) > APM > Example Messaging App > Monitor > Distributed Tracing.
![DT View](./images/dt-view.png?raw=true "DT view")

6. Click a trace and you can see the messaging instrumentation recording relevant spans.
![Detailed trace](./images/dt-details.png?raw=true "Detailed Trace")

## Description

The application consists of the following files.

* [`messages.js`](./messages.js): a toy messaging app that exposes three prototypical methods, `publish`, `subscribe`, and `getMessage`.
* [`index.js`](./index.js): a simple Express app that makes use of the toy messaging app.
* [`instrumentation.js`](./instrumentation.js): all of the New Relic instrumentation is in here. The `npm start` command loads this module first.
* [`newrelic.js`](./newrelic.js): a basic, sample New Relic configuration.

The instrumentation in `instrumentation.js` makes use of [`instrumentMessages`](https://docs.newrelic.com/docs/apm/agents/nodejs-agent/api-guides/nodejs-agent-api/#instrumentMessages) and three relevant functions of the [messaging shim API](https://newrelic.github.io/node-newrelic/docs/MessageShim.html):

* [`recordProduce`](https://newrelic.github.io/node-newrelic/docs/MessageShim.html#recordProduce)
* [`recordConsume`](https://newrelic.github.io/node-newrelic/docs/MessageShim.html#recordConsume)
* [`recordSubscribedConsume`](https://newrelic.github.io/node-newrelic/docs/MessageShim.html#recordSubscribedConsume)

## Additional Configuration
If you are a New Relic employee and wanting to testing on a staging environment, add the following to the `npm start` command:

```sh
NEW_RELIC_HOST=staging-collector.newrelic.com
```
