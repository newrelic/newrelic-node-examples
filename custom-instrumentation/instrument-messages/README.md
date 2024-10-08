# Example instrumentation of a messaging application

This is an example app that uses the [newrelic.instrumentMessages](https://newrelic.github.io/node-newrelic/API.html#instrumentMessages) and associated [messaging shim API](https://newrelic.github.io/node-newrelic/MessageShim.html) to instrument a toy messaging library called Nifty Messages.

## Introduction

Modules that interact with message brokers will typically provide:

* a function to publish a message
* a function to get a single message
* a function to subscribe to receive messages

Publishing a message typically occurs as a part of an existing transaction. For example, an Express server receives an HTTP request, publishes a message to a message broker, and responds to the HTTP request. In this case, the interesting information to capture would be how long the publish operation took as well as any identifying information about the publish operation, such as the name of the queue we were publishing to.

```js
var client = createMessageBrokerClient()

// express server
var app = express()

app.get('/', function(req, res) {
  client.publish('queueName', 'some message', function(err) {
    res.end()
  })
})
```

Consuming messages can take two forms: Either the client pulls a message from a queue, or it subscribes to receive messages as they become available (pub/sub pattern).

Pulling a message from the queue is a one-off operation, which would typically be part of an existing transaction. Similar to the publish example above, we want to know how long it took to get the message from the broker.

```js
var client = createMessageBrokerClient()

// express server
var app = express()

app.get('/', function(req, res) {
  client.getMessage('queueName', function(err, msg) {
    // Do something with the message...

    res.end()
  })
})
```

With the pub/sub pattern, the application is continuously listening to incoming messages, and therefore receiving a message does not necessarily occur inside an existing transaction. Instead, it is comparable to receiving an HTTP request, and can be thought of as a start of a new transaction.

Here is an example of a client subscribing to receive messages:

```js
var client = createMessageBrokerClient()

client.subscribe('queueName', function consumeMessage(message) {
  // get current transaction, in order to later signal that it should be ended
  var transaction = newrelic.getTransaction()

  // do something with the message and when done, end the transaction
  processMessage(message, function(err) {
    transaction.end()
  })
})
```

Every time `consumeMessage` is called, we want to record the work to process a message as a new transaction. 

Now that we have established what to instrument, headover to `instrumentation.js` to see how we instrument it.

## Getting started

1. Clone or fork, this repository,
2. Go into this subdirectory,

```sh
cd newrelic-node-examples/messaging-app
```

3. Install dependencies and run application

```sh
npm install
PORT=3000 NEW_RELIC_LICENSE_KEY=<Your New Relic License Key> npm start
```

This will start an Express app tied to a local-only Nifty Messages toy application at `http://localhost:3000`, with four endpoints: `/` for getting messages, `/purge` for purging a queue, `/publish` with a GET query parameter `msg` for publishing a message, and `/subscribe` for starting a message subscription to the `main` queue. All endpoints also accept a `queueName` GET parameter, which defaults to `main`.

4. Make requests to the application

```sh
# Publish two messages
curl 'http://localhost:3000/publish?msg=hello'
curl 'http://localhost:3000/publish?msg=goodbye'

# Fetch the two messages
curl 'http://localhost:3000/'
curl 'http://localhost:3000/'

# Publish two messages but immediately purge them
curl 'http://localhost:3000/publish?msg=hello+again'
curl 'http://localhost:3000/publish?msg=goodbye+again'
curl 'http://localhost:3000/purge'

# Subscribe to get all messages
curl 'http://localhost:3000/subscribe'

# Publish two more
curl 'http://localhost:3000/publish?msg=hello+yet+again'
curl 'http://localhost:3000/publish?msg=goodbye+yet+again'

# Get the messages processed by the subscription
curl 'http://localhost:3000/'
```

This should produce server output similar to this. The lines prefixed with `[NEWRELIC]` are output emitted by the sample instrumentation. The other lines are emitted by the messaging application itself.

```
[NEWRELIC] instrumenting ./nifty-messages
[NEWRELIC] instrumenting method 'publish'
[NEWRELIC] instrumenting method 'purge'
[NEWRELIC] instrumenting callbacks of method 'getMessage'
[NEWRELIC] instrumenting callbacks of method 'subscribe'
Server started at http://127.0.0.1:3000
[NEWRELIC] publish called on queue 'main' with message 'hello'
called method 'publish'
[NEWRELIC] publish called on queue 'main' with message 'goodbye'
called method 'publish'
called method 'getMessage'
[NEWRELIC] getMessage on queue main returned a message: 'hello'
called method 'getMessage'
[NEWRELIC] getMessage on queue main returned a message: 'goodbye'
[NEWRELIC] publish called on queue 'main' with message 'hello again'
called method 'publish'
[NEWRELIC] publish called on queue 'main' with message 'goodbye again'
called method 'publish'
[NEWRELIC] purge called on queue 'main'
called method 'purge'
called method 'subscribe'
[NEWRELIC] publish called on queue 'main' with message 'hello yet again'
called method 'publish'
called handler on queue 'main'
[NEWRELIC] subscribe on queue main returned a message: 'hello yet again'
[NEWRELIC] publish called on queue 'main' with message 'goodbye yet again'
called method 'publish'
called handler on queue 'main'
[NEWRELIC] subscribe on queue main returned a message: 'goodbye yet again'
called method 'getMessage'
[NEWRELIC] getMessage on queue main returned a message: 'undefined'
```

5. Navigate to [New Relic One](https://one.newrelic.com) > APM > Example Messaging App > Monitor > Distributed Tracing.
   ![DT View](./images/dt-view.png?raw=true "DT view")
6. Click a trace and you can see the messaging instrumentation recording relevant spans.
   ![Detailed trace](./images/dt-details.png?raw=true "Detailed Trace")

## Description

The application consists of the following files.

* [`nifty-messages.js`](./nifty-messages.js): a toy messaging app called Nifty Messages that exposes four prototypical methods, `publish`, `purge`, `subscribe`, and `getMessage`.
* [`index.js`](./index.js): a simple Express app that makes use of the toy messaging app.
* [`instrumentation.js`](./instrumentation.js): all of the New Relic instrumentation is in here. The `npm start` command loads this module first.
* [`newrelic.js`](./newrelic.js): a basic, sample New Relic configuration.
* [`recordProduce`](https://newrelic.github.io/node-newrelic/MessageShim.html#recordProduce)
* [`recordConsume`](https://newrelic.github.io/node-newrelic/MessageShim.html#recordConsume)
* [`recordSubscribedConsume`](https://newrelic.github.io/node-newrelic/MessageShim.html#recordSubscribedConsume)

## Additional Configuration

If you are a New Relic employee and wanting to testing on a staging environment, add the following to the `npm start` command:

```sh
NEW_RELIC_HOST=staging-collector.newrelic.com
```
