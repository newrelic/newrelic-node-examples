'use strict'

/**
 * WHY THIS FILE IS `.cjs` INSTEAD OF `.js`
 * ----------------------------------------
 * This file must use `.cjs` (CommonJS module syntax) because:
 * - The New Relic Node.js agent is a CommonJS-only module.
 * - If your project uses `"type": "module"` in package.json (like with Next.js + App Router),
 *   then `.js` files are treated as ESM, which will break when New Relic tries to `require()` this file.
 *
 * Using `.cjs` guarantees compatibility with New Relic’s internal config loader,
 * which expects CommonJS syntax.
 *
 * Your `NEW_RELIC_LICENSE_KEY` should be an account API key, with the "Type" set to "INGEST - LICENSE".
 */

exports.config = {
  /**
   * This application_logging block shows the default configuration. That is,
   * it is not technically necessary; if it were omitted completely, we'd still
   * get the same configuration applied.
   *
   * We are including it here for illustrative purposes. With log forwarding
   * enabled, the Pino instance returned by `lib/logger.js` will be instrumented
   * by the `newrelic` agent and ship logs to New Relic so that they can be
   * viewed in the dashboard.
   */
  app_name: [process.env.NEW_RELIC_APP_NAME],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  application_logging: {
    forwarding: {
      enabled: true,
    },
  },

  logging: {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level: 'trace',
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
      'response.headers.x*',
    ],
  },
}
