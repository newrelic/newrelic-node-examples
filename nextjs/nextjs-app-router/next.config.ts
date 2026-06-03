/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import type { NextConfig } from 'next'

// newrelic/load-externals is a CommonJS module with no type declarations
const nrExternals = require('newrelic/load-externals')  

const nextConfig: NextConfig = {
  // `newrelic` is automatically opted out of bundling in Next.js 15+, so it does not need to be listed here.
  // Add any other dependencies that should not be bundled for server components:
  // See https://nextjs.org/docs/app/api-reference/config/next-config-js/serverExternalPackages
  // serverExternalPackages: ['some-other-dep']

  // In order for newrelic to effectively instrument a Next.js application,
  // the modules that newrelic supports should not be mangled by webpack. Thus,
  // we need to "externalize" all of the modules that newrelic supports.
  webpack: (config) => {
    nrExternals(config)
    return config
  },

  // Turbopack: Next.js offers the Turbopack incremental bundler as a replacement for webpack.
  // Unlike webpack, Turbopack config is an object (TurbopackOptions), not a callable function.
  // The `nrExternals` helper is webpack-specific and does not apply to Turbopack.
  //
  // In Next.js 15, `newrelic` is already automatically opted out of bundling when using Turbopack.
  // No additional turbopack configuration is needed for New Relic.
  //
  // If you need to externalize additional packages, use serverExternalPackages:
  // serverExternalPackages: ['some-other-dep']
  //
  turbopack: {
    // TurbopackOptions fields (resolveAlias, resolveExtensions, rules, etc.)
    // No externals needed — newrelic is automatically excluded in Next.js 15+
  }
}

export default nextConfig
