'use strict'
/**
 * New Relic agent configuration.
 *
 * See lib/config/default.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  host: 'staging-collector.newrelic.com',
  /*
  app_name: ['k2-demo'],
  security: {
    enabled: true,
    agent: {
      enabled: true
    },
    validator_service_url: 'wss://csec-staging.nr-data.net'
  },
  */
  app_name: ['bob-infinite-tracing'],
  infinite_tracing: {
    // mock location
    /*trace_observer: {
      host: 'localhost',
      port: '50051'
    },
    */
    trace_observer: {
      host: 'a140b86b-7e23-4adc-bd03-6a684a98ecb3.aws-us-east-2.tracing.staging-edge.nr-data.net'
    },
    batching: true,
    compression: true
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
