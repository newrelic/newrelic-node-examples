This is an example of an instrumented Next.js app using [Pages Router](https://nextjs.org/docs/pages)

## Overview

This example application shows a list of users and provides a form for editing
individual users. When editing a user's name, no error will occur. When editing
a user's age, an error condition will be encountered.

A few source files to pay particular attention to:

+ [next.config.js](./next.config.js): shows configuration necessary to get
  instrumentation for all of the libraries New Relic's Node.js agent supports.
+ [newrelic.js](./newrelic.js): shows how to enable application logging. This
  application forwards server-side logs via our instrumentation of the Pino logger.
+ [pages/_document.js](./pages/_document.jsx): shows how to enable the browser
  agent.
+ [pages/user/edit/[id].jsx](./pages/user/edit/%5Bid%5D.jsx): shows how to
  handle errors on both the client and server. When updating a user's age, an
  error will be returned, presented in the client, and available in the New Relic
  dashboard.
+ [pages/hello/[value].jsx](./pages/hello/%5Bvalue%5D.jsx): shows a static page
  that has been generated at compile time. Views of this sort of page will show
  up appropriately in the New Relic dashboard.

## Setup

1. Copy [.env.sample](./.env.sample) to `.env`.
2. Edit `.env` to add your New Relic app name and license key
   (see "Enabling APM collection" below).
3. Install packages: `npm install`.
4. Build the application: `npm run build`
5. Start the application: `npm start`.
6. Browse the application: http://127.0.0.1:3000/
