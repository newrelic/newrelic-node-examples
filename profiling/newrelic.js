/*
 * Copyright 2026 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

/**
 * New Relic agent configuration.
 *
 * License key and collector host come from .env (NEW_RELIC_LICENSE_KEY,
 * NEW_RELIC_HOST).
 */
exports.config = {
  app_name: ['profiling-example-app'],
  logging: {
    // trace so we can see `pprof_data` POSTs and the collector's response code
    level: 'trace'
  },
  distributed_tracing: {
    enabled: true
  },
  profiling: {
    enabled: true,
    // individually include cpu or heap if you are testing them specifically
    include: ['cpu', 'heap'],
    // start immediately, run for the life of the process
    delay: 0,
    duration: 0,
    // Resolve profiler frames back to original .ts source (via dist/*.js.map) instead of compiled dist/index.js. Off by default; the `start:source-map` npm script sets NEW_RELIC_PROFILING_SOURCE_MAPPING_ENABLED=true so you can A/B the two.
    source_mapping: {
      enabled: false
    }
  }
}
