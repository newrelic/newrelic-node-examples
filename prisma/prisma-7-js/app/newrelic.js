/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

/**
 * New Relic agent configuration.
 *
 * See lib/config/default.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */

exports.config = {
  /**
   * Exclude the following libraries from agent instrumentation.
   * If `opentelemtry` is enabled, these libraries will be
   * instrumented by OpenTelemetry instead.
   */
  instrumentation: {
    /**
     * We disable New Relic's `pg` intrumentation because `prisma` will supply
     * the necessary tracing data.
     */
    pg: { enabled: false },

    /**
     * We disable New Relic's `@prisma/client` instrumentation because it is
     * only effective for the old WASM variant.
     */
    '@prisma/client': { enabled: false }
  },

  /**
   * The below is required to enable the OpenTelemetry bridge.
   */
  opentelemetry: {
    enabled: true,
    traces: {
      enabled: true
    }
  },

  logging: {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level: 'trace'
  },

  /**
   * When true, all request headers except for those listed in attributes.exclude
   * will be captured for all traces, unless otherwise specified in a destination's
   * attributes include/exclude lists.
   */
  allow_all_headers: true,

  attributes: {
    /**
     * Prefix of attributes to exclude from all destinations. Allows * as wildcard
     * at end.
     *
     * NOTE: If excluding headers, they must be in camelCase form to be filtered.
     *
     * @env NEW_RELIC_ATTRIBUTES_EXCLUDE
     */
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*'
    ]
  }
}
