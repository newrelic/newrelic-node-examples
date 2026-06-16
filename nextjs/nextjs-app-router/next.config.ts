import type { NextConfig } from "next";

// newrelic/load-externals is a CommonJS module with no type declarations
// const nrExternals = require('newrelic/load-externals')

const nextConfig: NextConfig = {
  // The New Relic agent loads ~74 of its own files via Node subpath-imports
  // (`require('#agentlib/*.js')`) plus dynamically-required instrumentation.
  // @vercel/nft can't statically resolve those, so a webpack build under-traces
  // the package and the Lambda crashes with "Cannot find module". Force the full
  // agent (and its scoped deps) into every server trace.
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/newrelic/**/*",
    ],
  },

  // `newrelic` is automatically opted out of bundling in Next.js 15+, so it does not need to be listed here.
  // If you find that you're missing instrumentation in your Next.js app using webpack, you may need to externalize
  // 3rd party libraries from the webpack bundle.
  // Add any other dependencies that should not be bundled for server components:
  // See https://nextjs.org/docs/app/api-reference/config/next-config-js/serverExternalPackages
  // serverExternalPackages: ['some-other-dep']

  // In order for newrelic to effectively instrument a Next.js application,
  // the modules that newrelic supports should not be mangled by webpack. Thus,
  // we need to "externalize" all of the modules that newrelic supports.
  //webpack: (config) => {
  //  nrExternals(config)
  //  return config
  //},

};

export default nextConfig;
