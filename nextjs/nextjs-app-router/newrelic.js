'use strict'

/**
 * New Relic agent configuration.
 *
 * See lib/config/default.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Enables the hybrid agent (OpenTelemetry bridge) mode, which routes OTel
   * SDK signals through the New Relic agent pipeline instead of exporting them
   * directly. This allows standard OTel instrumentation libraries to be used
   * alongside the agent without duplicating telemetry.
   *
   * NOTE: The OpenTelemetry bridge for Next.js requires Next.js >= 16 and
   * newrelic >= 14.1.0. It is not supported on earlier versions of Next.js.
   *
   * @see https://docs.newrelic.com/docs/apm/agents/nodejs-agent/getting-started/opentelemetry-nodejs/
   */
  opentelemetry: {
    enabled: true
  },
  instrumentation: {
    http: {
      enabled: false
    },
    next: {
      enabled: false
    },
    // if you're doing native `fetch` calls
    // you must disable undici instrumentation
    // as Next.js has wrapped `fetch` and create client spans
    // if you do not disable undici instrumentation you will have 
    // duplicate client spans in your traces.
    undici: {
      enabled: false
    },
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
     * @name NEW_RELIC_ATTRIBUTES_EXCLUDE
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
