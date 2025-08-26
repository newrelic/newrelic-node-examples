/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import newrelic from 'newrelic'
newrelic.instrument({ moduleName: 'parse-json',
  isEsm: true,
  onRequire: function(shim, parseJson, modName) {
    shim.wrap(parseJson, 'default', function wrapParseJson(shim, orig) {
      return function wrappedParsedJson() {
      // call original parseJson function and get result
        const result = orig.apply(this, arguments)
        // apppend a key of `instrumented`
        result.instrumented = true
        return result
      }
    })
  } })
