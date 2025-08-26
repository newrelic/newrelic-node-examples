/*
 * Copyright 2022 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

// This is the file that instruments our web framework.

const newrelic = require('newrelic')
const frameworkPath = require.resolve('./simple-framework')

// To add instrumentation to a web framework, you supply a single function
// which is responsible for telling New Relic which framework methods
// should be instrumented and what metrics and data to collect. The agent
// calls this instrumentation function automatically when the web framework
// module is required in the user's code. The function must be registered
// with the agent by calling instumentWebframework.
newrelic.instrumentWebframework({
  absolutePath: frameworkPath,
  moduleName: 'simple-framework',
  onRequire: instrumentMyWebFramework
})

// The instrumentation function can be included in the application
// code itself or it can live in a separate instrumentation module.
// In either case, we need to register it in our application code
// in order for the agent to use it.
//
// In this example, we are defining in here.
function instrumentMyWebFramework(shim, myModule, moduleName) {
  console.log(`[NEWRELIC] instrumenting ${moduleName}`)
  const Framework = myModule.SimpleFramework

  // The first thing the instrumentation should do is specify the
  // name of the framework it is instrumenting. The value is used
  // as a part of metric names and transaction event attributes.
  shim.setFramework('mySimpleFramework')

  // There are two API functions related to middleware -
  // `recordMiddleware` and `wrapMiddlewareMounter`. Based on our
  // SimpleFramework code, we will record a middleware
  // metric for the authentication middleware, and also for the
  // endpoint middleware that responds to a specific request.
  //
  // We will use the `wrapMiddlewareMounter `method to wrap `all`
  // and `get`. The third argument in that call is the spec where
  // we tell the instrumentation which argument is the route path,
  // and what to do with all other arguments that represent the
  // middleware functions. The instrumentation will call the `wrapper`
  // function for each middleware function, and here we need to wrap
  // the original function and return the wrapped version of it.
  shim.wrapMiddlewareMounter(Framework.prototype, ['all', 'get'], {
    route: shim.FIRST,
    wrapper: function wrapMiddleware(shim, fn, name, route) {
      // This is where `recordMiddleware` comes in. It takes the
      // original middleware function as the first argument, and a
      // spec describing the middleware function signature. The
      // `req`, `res`, and `next`parameters tell the instrumentation
      // which arguments are which. The `route `and `type` arguments
      // are used for correctly naming the middleware metrics.
      return shim.recordMiddleware(fn, new shim.specs.MiddlewareSpec({
        route,
        type: shim.MIDDLEWARE,
        req: shim.FIRST,
        res: shim.SECOND,
        next: shim.THIRD
      }))
    }
  })

  // SimpleFramework has a function called render that takes the name
  // of a view and a callback. The callback returns the generated content.
  // In order to record this work as the View metric, we will call
  // recordRender.
  //
  // Note that in some cases (e.g. in Express) the `render` function may
  // be directly on the `req` object and may be invoked without accepting a
  // callback. In this case calling the `render` function could be ending
  // the HTTP response itself. In such a case, in order to capture correct
  // timing for the render function, additional instrumentation would be
  // needed based on how the web framework is implemented.
  shim.recordRender(Framework.prototype, 'render', new shim.specs.RenderSpec({
    view: shim.FIRST,
    callback: shim.LAST
  }))
}
