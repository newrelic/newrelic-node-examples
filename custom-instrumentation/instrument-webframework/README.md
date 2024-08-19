# Example instrumentation of a web framework application

This is an example app that uses the [newrelic.instrumentWebframework](https://newrelic.github.io/node-newrelic/API.html#instrumentWebframework) and associated [WebFramework shim API](https://newrelic.github.io/node-newrelic/WebFrameworkShim.html) to instrument a hypothetical web framework that has similar concepts to popular web frameworks, such as Express or Restify.

## What to Record

Web framework instrumentation will generally be responsible for the following:

* naming the transaction
* recording metrics for middleware functions
* recording metrics for rendering views
* reporting errors that are handled by the web framework

### Transaction Naming

A single transaction represents all activity that is tied to a single HTTP request from the time it is received until the app server sends a response back. In order to see meaningful metrics for similar transactions (e.g. ones that hit the same URL endpoint), the instrumentation needs to determine and assign a name for each transaction.

The Node agent names transactions using the HTTP verb and the request URI. The verb is automatically determined from the HTTP request. However, the URI must typically be normalized in order to group related transactions in a meaningful way. For more details, see [Metric grouping issues](https://docs.newrelic.com/docs/agents/manage-apm-agents/troubleshooting/metric-grouping-issues).

The API provides a basic function for setting the URI to use for naming - see `setTransactionUri`. This would be sufficient for a very basic use case when the URI can be determined in a single point in the instrumentation code.

However, many common web frameworks route each request through many functions, which may contribute to the final name. In order to help with the common use case of nested middlewares, the API provides a mechanism for naming transactions based on paths that middleware functions are mounted on

### Middlewares

Many frameworks have a concept of middlewares. Middleware is a function that is executed in response to a request for a specific URL endpoint. Middleware can either respond to the HTTP request or pass control to another middleware. Since there can be many middlewares executed for a single request, it is useful to know how much time is spent in each middleware when troubleshooting performance.

Note that middleware functions may not be exposed directly on the framework. In order to get access to the middleware function so that you can call `recordMiddleware`, you may need to wrap the framework method that is used to register the middleware.

A common pattern is a function that takes a path and one or more middleware functions. For example, Express has routing methods such as `get`, `post`, `put`, and `use`. The Restify framework has a similar pattern. In our example framework, `SimpleFramework`, we use the `get` and `all` methods the same way.

Since this is a common pattern, our API provides method `wrapMiddlewareMounter` to make it easier to wrap middlewares in this particular case. In cases where the framework has a different mechanism for registering middlewares, the instrumentation would need to fallback to basic [wrapping](https://newrelic.github.io/node-newrelic/Shim.html#wrap) in order to get to the place where middleware functions can be intercepted. For an example of instrumentation that does not use `wrapMiddlewareMounter`, see our built-in Hapi instrumentation.

The following types are allowed for the `route` and `type` arguments:

| type | description | generated metric | trace segment | | --- | --- | --- | | MIDDLEWARE | Represents a generic middleware function. This could be a function that is executed for all types of requests (e.g. authentication), or a responder function associated (mounted) with a specific URL path. | `Nodejs/Middleware/<framework>/<function name>/<mounted path>` | `Middleware: <function name> <mounted path>`

Note: If the middleware is nested under a ROUTE middleware, the path is omitted (since it's displayed in the ROUTE segment name). | | ERRORWARE | Used for recording middlewares that are used for handling errors. | `Nodejs/Middleware/<framework>/<function name>/<mounted path>`

Note: The mounted path will reflect the path that was current when the error occurred. If the error handler itself is not mounted on a path, its path is appended to the originating path. | `Middleware: <function name> <mounted path>` | | PARAMWARE | This is a special type of middleware used for extracting parameters from URLs. | `Nodejs/Middleware/<framework>/<function name>//[param handler :<param name>]` | `Middleware: <function name> /[param handler :<param name>]` | | ROUTE | Used for grouping multiple middleware functions under a single route path. | no metric | `Route Path: <mounted path>` | | ROUTER | Used to create a trace segment for a router object that is mounted on a path. | no metric | `Router: <mounted path>` | | APPLICATION | Used for application object that is mounted as a router. This is a concept in Express, and typically will not be used in other framework instrumenations. | no metric | `Mounted App: <mounted path>`

### Views

Web frameworks will often provide mechanisms for rendering views from templates. Rendering views can be time consuming, and therefore New Relic can collect and display a specific metric (`View/<view name>/Rendering`) related to this. In order to capture these metrics, use the `recordRender` API method.

### Errors

Web frameworks will typically capture errors generated from middlewares (either uncaught or provided by the user, e.g. by calling `next(error)` in Express) and respond with a HTTP 500 error. If these errors are not handled by the user (e.g. using an errorware function), then it is more useful to report the original errors instead of a generic HTTP 500). The API provides the `noticeError` method for reporting errors to New Relic.

Let's assume that our web framework emits an event everytime an error occurs. We can listen on this event, and call `noticeError`.

```js
server.on('error', function(req, error) {
  shim.noticeError(req, error)
})
```

Now let's assume that at a later point, the web framework calls a middleware where the user handles the error themselves. In this case, the error should no longer be reported. We can use the `errorHandled` function to remove the error:

```js
shim.errorHandled(req, error)
```

## Getting started

1. Clone or fork this repository
2. Navigate to the example's subdirectory:

```sh
cd newrelic-node-examples/custom-instrumentation/instrument-webframework
```

3. Update the `license_key` in the `newrelic.js` config file with your license key.
4. Install dependencies and run the application

```sh
npm install
npm start
```

4. Make requests to the application

   Using curl:

   ```sh
   # Fetch users
   curl http://localhost:3000/api/users

   # Fetch homepage
   curl http://localhost:3000/home  
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
