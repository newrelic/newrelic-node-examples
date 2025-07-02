# OpenTelemetry Example Application

This is an example app that uses the
[New Relic agent](https://github.com/newrelic/node-newrelic) in the
OpenTelemetry bridge mode with `knex`, `express`, and `fetch`.

Included in this example is usage of the
[OpenTelemetry metrics API](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/sdk-metrics).
This will show how to record metrics and how to retrieve that recorded
information.

## Setup

**Note**: This is used to demonstrate behavior of the New Relic Node.js
agent with the OpenTelemetry bridge enabled.

Requirements:
  + Node.js >= 20.6.0


```sh
npm install
cp env.sample .env
# Fill out `NEW_RELIC_LICENSE_KEY`
docker compose up -d
npm run db:migrate
npm run db:seed
npm start
```

To view distributed tracing `fetch-dt`, `http-dt`, you'll want to start up the second server:

```sh
cp env2.sample .env2
# Fill out `NEW_RELIC_LICENSE_KEY`
npm run start:server2
```

## Exploring Telemetry

### Create Traffic

Here are a few routes you can use to create traffic on the application.

* `curl localhost:3000/projects/1`
* `curl localhost:3000/users`
* `curl localhost:3000/users/1`
* `curl localhost:3000/users/1/projects`
* `curl localhost:3000/fetch`
* `curl localhost:3001/fetch-dt`
* `curl localhost:3001/http`
* `curl localhost:3001/http-dt`

### Metrics

Each route within the application increments a counter metric provided by
the OpenTelemetry metrics API. After issuing requests to the application, we
can query for these metrics via the New Relic One dashboard by issuing a query
like the following (as of 2025-07, the UI does not yet display these metrics):

```sql
from Metric
select *
where otel.library.name = 'otel-example'
since 30 minutes ago
```

Or, for a specific counter like the "get-user" counter:

```sql
from Metric
select *
where metricName = 'get-user'
since 30 minutes ago
```
