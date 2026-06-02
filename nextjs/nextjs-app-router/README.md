This is an example of an instrumented Next.js app using
[App Router](https://nextjs.org/docs).

> **Requires Next.js >= 16** — this example uses the New Relic hybrid agent
> (OpenTelemetry bridge) to generate telemetry, which is only supported with
> Next.js 16 and `newrelic >= 14.1.0`.
>
> Native New Relic agent support for Next.js 14 and 15 is no longer maintained
> in this example (though not yet deprecated). If you are on Next.js < 16, see
> the [nextjs-legacy](../nextjs-legacy) example.

## Overview

This example application shows a list of users and provides a form for editing
individual users. When editing a user's name, no error will occur. When editing
a user's age, an error condition will be encountered.

A few source files to pay particular attention to:

+ [next.config.ts](./next.config.ts): shows the webpack and Turbopack
  configuration necessary to externalize dependencies that New Relic instruments.
  Includes an explanation of why `nrExternals` is webpack-only and not needed
  for Turbopack.
+ [newrelic.js](./newrelic.js): enables the New Relic hybrid agent
  (`opentelemetry.enabled: true`), which bridges OTel SDK signals into the
  New Relic pipeline. Also disables the built-in `http`, `undici`, and `next`
  instrumentations to prevent duplicate spans when OTel instrumentations are
  active. Requires Next.js >= 16 and newrelic >= 14.1.0.
+ [otel-instrumentation.js](./otel-instrumentation.js): registers the OTel HTTP
  and Undici instrumentations that the hybrid agent bridges into New Relic.
  Required alongside the `opentelemetry.enabled: true` setting in `newrelic.js`.
+ [app/layout.js](app/layout.js): shows how to enable the browser agent.
+ [app/user/edit/[id]/page.js](app/user/edit/%5Bid%5D/page.js): shows how to
  handle errors on both the client and server. When updating a user's age, an
  error will be returned, presented in the client, and available in the New Relic
  dashboard.

## Setup

1. Copy [.env.sample](./.env.sample) to `.env`.
2. Edit `.env` to add your New Relic app name and license key
3. Build the application: `npm run build`
4. Start the application: `npm start`.
5. Browse the application: http://127.0.0.1:3000/
