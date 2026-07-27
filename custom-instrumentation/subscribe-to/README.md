# Example subscription to a simple module

This example application shows you how to use the `newrelic.subscribeTo` API — a subscriber-based
alternative to `newrelic.instrument`/`shim.record` for instrumenting modules that New Relic does
not already support. In this example, we subscribe to a simple module, a rudimentary job queue
(`job-queue`) that schedules and runs a series of basic jobs.

> **Note:** `subscribeTo` is not yet published. This example's `package.json` points its
> `newrelic` dependency at the local, in-development agent checkout via a `file:` path. Once
> `subscribeTo` ships in a release, swap that back to a normal version range.
>
> **Note:** `job-queue` is also a `file:` dependency (see `job-queue-pkg/`), and npm installs
> `file:` dependencies as symlinks. `subscribeTo` identifies which package a file belongs to by
> looking for a `node_modules` segment in its path, which a resolved symlink doesn't have - so
> the `start`/`debug` scripts run with `node --preserve-symlinks` to keep that segment intact.
> A normal (registry-installed) dependency wouldn't need this flag.

## Getting Started

1. Clone or fork this repository.
2. Navigate to this example's sub directory
   ```
   cd newrelic-node-examples/custom-instrumentation/subscribe-to
   ```
3. Install dependencies and run application.
   ```
   npm install
   cp env.sample .env
   # Fill out `NEW_RELIC_LICENSE_KEY` in .env and save
   # Start the application
   npm start
   ```
4. The app will automatically start adding example jobs to a queue and run them. You should see
   the following in the console when the subscription takes place.
   ```
   [NEWRELIC] scheduleJob ended for firstJob
   [NEWRELIC] scheduleJob ended for secondJob
   Callback job done
   [NEWRELIC] runJobs ended
   Promise job done
   [NEWRELIC] processJob resolved with: "Promise job done"
   processJob result: Promise job done
   ```

## Exploring Telemetry

1. After a few minutes, you should be able to see `job-queue` instrumented in New Relic. From the
   dashboard, navigate to 'APM & Services' and then select the 'Example Job Queue App (subscribeTo)'
   entity.
2. Then select 'Distributed tracing'. You should see the trace group `jobQueueDemo`. Everything in
   this example runs inside that one transaction, so `scheduleJob`, `runJobs`, and `processJob` all
   show up as segments in the same trace, making their relative timings easy to compare.
3. Select a `jobQueueDemo` trace and toggle 'Show in-process spans'. You'll see two segments for
   `scheduleJob` (near-instant - it only queues the job), a segment for `runJobs`, and a segment
   for `processJob` that visibly spans the ~50ms async delay and resolution, since it's created
   from an `asyncEnd` event rather than a synchronous `end`.

## Description

This application consists of the following files:

* `index.js`: a simple app that utilizes our example module
* `job-queue-pkg/`: a tiny local package providing a queue class you can use to run and schedule
  jobs. It's a real dependency (see `package.json`) rather than a sibling file, because
  `subscribeTo` rewrites the target package's source as it's loaded, which requires the package to
  be resolvable like any other npm dependency (i.e. it must live under `node_modules`, same as a
  real third-party library would).
* `instrumentation.js`: the `newrelic.subscribeTo` call lives here, along with the `config`,
  `events`, and `handlers` that describe what to instrument and what to do when it fires. The
  `npm start` command makes sure this module is loaded first, before `index.js` ever requires
  `job-queue`.
* `newrelic.js`: a basic, sample New Relic configuration

For an example of `subscribeTo` creating its *own* transaction (rather than segments within an
already-active one), see the sibling `subscribe-to-message-consumer` example - a job queue doesn't
have a natural "arrives independently from outside" event the way a message consumer does, so
that case is demonstrated separately with a more fitting domain.
