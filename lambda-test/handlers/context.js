/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
module.exports = function lambdaHandler(event, context, cb) {
  return context.done(null, { hello: 'world' })
}
