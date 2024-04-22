'use strict'

const nrExternals = require('@newrelic/next/load-externals')

module.exports = {
  // In order for newrelic to effectively instrument a Next.js application,
  // the modules that newrelic supports should not be mangled by webpack. Thus,
  // we need to "externalize" all of the modules that newrelic supports.
  webpack: (config) => {
    nrExternals(config)
    return config
  }
}
