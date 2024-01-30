# Example instrumentation of a web framework application
This is an example app that uses the `newrelic.instrumentWebframework` [API function](https://docs.newrelic.com/docs/apm/agents/nodejs-agent/api-guides/nodejs-agent-api/#instrumentWebframework) and associated [WebFramework shim API](https://newrelic.github.io/node-newrelic/WebFrameworkShim.html) to instrument a hypothetical web framework. This sample instrumentation is similar to the [New Relic web framework instrumentation tutorial](https://newrelic.github.io/node-newrelic/tutorial-Webframework-Simple.html).


## Getting started

1. Clone or fork this repository

2. Navigate to the example's subdirectory:

``` sh
cd newrelic-node-examples/custom-instrument-apps/instrument-webframework
```

3. Install dependencies and run the application

```sh
npm ci
NEW_RELIC_LICENSE_KEY=<Your New Relic License Key> npm start
```

4. Make requests to the application

    Using curl:
    ```sh
    # Fetch users
    curl localhost:3000/api/users

    # Fetch homepage
    curl localhost:3000/home    
    ```

    Using browser:
    - fetch users
      + http://localhost:3000/api/users

    - fetch homepage
      + http://localhost:3000/home

5. Navigate to [New Relic One](https://one.newrelic.com) > APM & Services > Example Simple Framework App > Monitor > Distributed Tracing.

6. Click a trace and you can see the webframework instrumentation recording relevant spans.

## Description

The application consists of the following files.

* [`simple-framework.js`](./simple-framework.js): a webframework called Simple Framework with basic routing and middleware functionality. 
* [`index.js`](./index.js): a simple app that makes use of the simple framework.
* [`instrumentation.js`](./instrumentation.js): all of the New Relic instrumentation is in here. The `npm start` command loads this module first.
* [`newrelic.js`](./newrelic.js): a basic, sample New Relic configuration.

The instrumentation in `instrumentation.js` makes use of [`instrumentWebframework`](https://docs.newrelic.com/docs/apm/agents/nodejs-agent/api-guides/nodejs-agent-api/#instrumentWebframework) and various functions of the [web framework shim API](https://newrelic.github.io/node-newrelic/WebFrameworkShim.html):

* [`setFramework`](https://newrelic.github.io/node-newrelic/WebFrameworkShim.html)
* [`recordMiddleware`](https://newrelic.github.io/node-newrelic/WebFrameworkShim.html#recordMiddleware)
* [`recordRender`](https://newrelic.github.io/node-newrelic/WebFrameworkShim.html#recordRender)
