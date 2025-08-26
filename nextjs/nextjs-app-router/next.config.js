/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const nrExternals = require('newrelic/load-externals')

module.exports = {
  // For use with Next 14 and earlier:
  experimental: {
    // Without this setting, the Next.js compilation step will routinely
    // try to import files such as `LICENSE` from the `newrelic` module.
    // See https://nextjs.org/docs/app/api-reference/next-config-js/serverComponentsExternalPackages.
    serverComponentsExternalPackages: ['newrelic']
  },

  // In Next15, server external packages are no longer experimental, this property is renamed serverExternalPackages.
  // `newrelic` is already automatically opted out of bundling, so does not need to be defined here.
  // See https://nextjs.org/docs/app/api-reference/config/next-config-js/serverExternalPackages
  // serverExternalPackages: ['otherDependency']

  // In order for newrelic to effectively instrument a Next.js application,
  // the modules that newrelic supports should not be mangled by webpack. Thus,
  // we need to "externalize" all of the modules that newrelic supports.
  webpack: (config) => {
    nrExternals(config)
    return config
  }

  // Turbopack: NextJs offers the Turbopack incremental bundler as a replacement for webpack.
  // Its configuration requires a minimal change:
  //
  // turbopack: (config) => {
  //   nrExternals(config)
  //   return config
  // }
}
