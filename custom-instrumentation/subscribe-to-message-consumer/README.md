# Example subscription creating its own transaction

This example shows how to use `newrelic.subscribeTo` to create a **new transaction**, rather than
a segment within one that's already active - `newrelic.createSubscriberTransaction` and
`newrelic.runInSubscriberContext`. In this example, we subscribe to a simple message broker
client (`nifty-messages`) that delivers messages to a registered handler independently and
asynchronously, whenever someone publishes one - similar to how a real message consumer
(amqplib, kafkajs) works, and unlike a job queue's batch processing (see the sibling
`subscribe-to` example, which covers segments within an already-active transaction instead).

> **Note:** `subscribeTo`, `createSubscriberTransaction`, and `runInSubscriberContext` are not
> yet published. This example's `package.json` points its `newrelic` dependency at the local,
> in-development agent checkout via a `file:` path. Once they ship in a release, swap that back
> to a normal version range.
>
> **Note:** `nifty-messages` is also a `file:` dependency (see `nifty-messages-pkg/`), and npm
> installs `file:` dependencies as symlinks. `subscribeTo` identifies which package a file
> belongs to by looking for a `node_modules` segment in its path, which a resolved symlink
> doesn't have - so the `start`/`debug` scripts run with `node --preserve-symlinks` to keep that
> segment intact. A normal (registry-installed) dependency wouldn't need this flag.

## Getting Started

1. Clone or fork this repository.
2. Navigate to this example's sub directory
   ```
   cd newrelic-node-examples/custom-instrumentation/subscribe-to-message-consumer
   ```
3. Install dependencies and run application.
   ```
   npm install
   cp env.sample .env
   # Fill out `NEW_RELIC_LICENSE_KEY` in .env and save
   # Start the application
   npm start
   ```
4. The app subscribes to an `orders` queue, then publishes three messages a fifth of a second
   apart. You should see the following in the console.
   ```
   [NEWRELIC] received message on 'orders': order #1
   [NEWRELIC] received message on 'orders': order #2
   [NEWRELIC] received message on 'orders': order #3
   ```

## Exploring Telemetry

1. After a few minutes, you should be able to see `nifty-messages` instrumented in New Relic.
   From the dashboard, navigate to 'APM & Services' and then select the 'Example Message Consumer
   App (subscribeTo)' entity.
2. Then select 'Distributed tracing'. You should see a `subscribeToOrders` transaction (a
   throwaway one, just for the registration call - see the note on `requireActiveTx` below), a
   `publishOrders` transaction, and **three separate `Consume/Named/orders` transactions** - one
   per message. Each of those three is created fresh by `createSubscriberTransaction`, entirely
   independent of `publishOrders` even though that's what triggered them.
3. Select one of the `Consume/Named/orders` traces and toggle 'Show in-process spans'. You'll see
   a `processMessage` segment nested under the transaction's base segment -
   `createSubscriberTransaction` only creates the base segment for the transaction itself, so the
   handler also calls `newrelic.createSubscriberSegment` to create a segment for the actual
   message-processing work, with the message attached as an attribute on it.

## Description

This application consists of the following files:

* `index.js`: a simple app that publishes messages to our example message broker client.
* `nifty-messages-pkg/`: a tiny local package providing an `EventEmitter`-based pub/sub client.
  It's a real dependency (see `package.json`) rather than a sibling file, for the same reason as
  the `subscribe-to` example - `subscribeTo` needs the package to be resolvable like a real npm
  dependency, under `node_modules`.
* `instrumentation.js`: the `newrelic.subscribeTo` call lives here. `subscribe`'s handler fires
  once, at registration time, and swaps in a wrapper around the handler being registered - that
  wrapper is what calls `newrelic.createSubscriberTransaction`, `newrelic.createSubscriberSegment`
  (for the message-processing work itself), and `newrelic.runInSubscriberContext` on every later,
  independent delivery.
* `newrelic.js`: a basic, sample New Relic configuration

### A gotcha worth knowing: `requireActiveTx`

Subscribers default to `requireActiveTx: true` - `subscribeTo` doesn't yet expose a way to change
this - meaning a subscribed function's `handler` only fires if there's an *active transaction* at
the moment the function is called. `subscribe()` is normally the kind of setup call you'd make at
startup, outside of any transaction - but if it were called that way here, `handler` would never
fire, our wrapper would never get installed, and messages would silently be delivered to the
*original*, uninstrumented handler with no error or warning at all. That's why `index.js` wraps
the `subscribe()` call itself in a short-lived, throwaway `subscribeToOrders` transaction - purely
to give `handler` something active to fire against.
