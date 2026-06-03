/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

// This file defines the overall layout of all pages in the application.
// The default function exported from this module must return a document with
// `html` and `body` tags. A `head` tag will be ignored.

import Script from 'next/script'
import Link from 'next/link'

// Somehow, this ends up including our static stylesheet correctly.
// See https://nextjs.org/docs/app/building-your-application/styling/css-modules#global-styles.
import './style.css'

export default async function RootLayout({ children }) {
  // During `next build` the New Relic agent is not running (--require newrelic
  // is only in the start/dev scripts, not the build script). Requiring newrelic
  // at build time initializes the agent, which then waits indefinitely for a
  // 'connected' event that never fires, hanging every page worker.
  // NEXT_PHASE is set to 'phase-production-build' only during `next build`.
  let browserTimingHeader = ''
  if (process.env.NEXT_PHASE !== 'phase-production-build') {
    const newrelic = require('newrelic')

    // getBrowserTimingHeader returns an empty string when the agent is not yet
    // connected (e.g. missing license key), so no connection wait is needed.
    browserTimingHeader = newrelic.getBrowserTimingHeader({
      hasToRemoveScriptWrapper: true,
      allowTransactionlessInjection: true,
    })
  }

  return (
    <html>
    <body>
    <ul className='navbar'>
      <li><Link href='/'>Home</Link></li>
      <li><Link href='/users' key='users'>Users</Link></li>
      <li><Link href='/about' key='about'>About</Link></li>
    </ul>
    {children}

    <Script
      // We have to set an id for inline scripts.
      // See https://nextjs.org/docs/app/building-your-application/optimizing/scripts#inline-scripts
      id='nr-browser-agent'
      // By setting the strategy to "beforeInteractive" we guarantee that
      // the script will be added to the document's `head` element.
      strategy='beforeInteractive'
      // The body of the script element comes from the async evaluation
      // of `getInitialProps`. We use the special
      // `dangerouslySetInnerHTML` to provide that element body. Since
      // it requires an object with an `__html` property, we pass in an
      // object literal.
      dangerouslySetInnerHTML={{ __html: browserTimingHeader }}
    />
    </body>
    </html>
  )
}
