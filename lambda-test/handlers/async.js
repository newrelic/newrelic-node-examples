/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const metrics = require('../lib/metrics.js')

module.exports = async function lambdaHandler() {
  metrics.integers.add(1)

  const req = await Promise.resolve({ hello: 'world' })
  return req
}
