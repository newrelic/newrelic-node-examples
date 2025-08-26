/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
module.exports = async function lambdaHandler() {
  const req = await new Promise((resolve) => {
    resolve({ hello: 'world' })
  })
  return req
}
