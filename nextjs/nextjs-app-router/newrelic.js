/* eslint-disable @typescript-eslint/no-require-imports -- New Relic loads this config via CommonJS require(); it cannot be an ES module. */
require('dotenv').config()

exports.config = {
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
  }
}
