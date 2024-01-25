/*
 * Copyright 2022 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const newrelic = require('newrelic')

newrelic.instrumentWebframework('SimpleFramework', instrumentMyWebFramework)

function instrumentMyWebFramework(shim, myModule, moduleName) {
  console.log(`[NEWRELIC] instrumenting ${moduleName}`)

  shim.setFramework('mySimpleFramework')

  const Framework = myModule.SimpleFramework

  shim.wrapMiddlewareMounter(Framework.prototype, ['get', 'post'], {
    route: shim.FIRST,
    wrapper: function wrapMiddleware(shim, fn, name, route) {
      return shim.recordMiddleware(fn, {
        route: route,
        type: shim.MIDDLEWARE,
        req: shim.FIRST,
        res: shim.SECOND,
        next: shim.THIRD
      })
    }
  })
}