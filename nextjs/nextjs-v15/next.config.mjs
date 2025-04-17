// New Relic ESM-aware external configuration helper
// We explicitly include the `.js` extension to satisfy the ESM loader.
import nrExternals from 'newrelic/load-externals.js'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // serverExternalPackages is the officially supported, no longer needing `serverComponentsExternalPackages`.
  serverExternalPackages: ['newrelic'],

  // In order for newrelic to effectively instrument a Next.js application,
  // the modules that newrelic supports should not be mangled by webpack. Thus,
  // we need to "externalize" all of the modules that newrelic supports.
  webpack: (config) => {
    nrExternals(config)
    return config
  }
}

export default nextConfig
