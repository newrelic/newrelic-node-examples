/*
 * Copyright 2026 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const otel = require('@opentelemetry/api')

module.exports = {
  integers: otel.metrics.getMeter('lambda-meter').createCounter('integers')
}
