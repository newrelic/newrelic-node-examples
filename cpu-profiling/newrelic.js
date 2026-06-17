/*
 * Copyright 2026 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

/**
 * New Relic agent configuration for exercising CPU profiling span labels.
 *
 * License key and collector host come from .env (NEW_RELIC_LICENSE_KEY,
 * NEW_RELIC_HOST) so the staging endpoint is set in one place.
 */
exports.config = {
  app_name: ['cpu-profiling-example'],
  logging: {
    // trace so we can see `pprof_data` POSTs and the collector's response code
    level: 'trace'
  },
  distributed_tracing: {
    enabled: true
  },
  profiling: {
    enabled: true,
    // isolate CPU so we only exercise the span-label path
    include: ['cpu'],
    // start immediately, run for the life of the process
    delay: 0,
    duration: 0,
    // Resolve profiler frames back to original .ts source (via dist/*.js.map) instead of compiled dist/index.js. Off by default; the `start:source-map` npm script sets NEW_RELIC_PROFILING_SOURCE_MAPPING_ENABLED=true so you can A/B the two.
    source_mapping: {
      enabled: false
    }
  }
}
