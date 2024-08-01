/*
 * Copyright 2022 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const newrelic = require('newrelic')
const frameworkPath = require.resolve('./simple-framework')

newrelic.instrumentWebframework({ absolutePath: frameworkPath, moduleName: 'simple-framework', onRequire: instrumentMyWebFramework})

function instrumentMyWebFramework(shim, myModule, moduleName) {
  console.log(`[NEWRELIC] instrumenting ${moduleName}`)

  shim.setFramework('mySimpleFramework')

  const Framework = myModule.SimpleFramework

  shim.wrapMiddlewareMounter(Framework.prototype, ['all', 'get'], {
    route: shim.FIRST,
    wrapper: function wrapMiddleware(shim, fn, name, route) {
      return shim.recordMiddleware(fn, new shim.specs.MiddlewareSpec({
        route: route,
        type: shim.MIDDLEWARE,
        req: shim.FIRST,
        res: shim.SECOND,
        next: shim.THIRD
      }))
    }
  })

  shim.recordRender(Framework.prototype, 'render', new shim.specs.RenderSpec({
    view: shim.FIRST,
    callback: shim.LAST
  }))
}
