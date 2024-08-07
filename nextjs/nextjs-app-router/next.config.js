'use strict'

const nrExternals = require('newrelic/load-externals')

module.exports = {
  experimental: {
    // Without this setting, the Next.js compilation step will routinely
    // try to import files such as `LICENSE` from the `newrelic` module.
    // See https://nextjs.org/docs/app/api-reference/next-config-js/serverComponentsExternalPackages.
    serverComponentsExternalPackages: ['newrelic']
  },

  // In order for newrelic to effectively instrument a Next.js application,
  // the modules that newrelic supports should not be mangled by webpack. Thus,
  // we need to "externalize" all of the modules that newrelic supports.
  webpack: (config) => {
    nrExternals(config)
    return config
  }
}
