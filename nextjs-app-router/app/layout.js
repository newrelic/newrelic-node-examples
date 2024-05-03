// This file defines the overall layout of all pages in the application.
// The default function exported from this module must return a document with
// `html` and `body` tags. A `head` tag will be ignored.

import Script from 'next/script'
import Link from 'next/link'
import newrelic from 'newrelic'

// Somehow, this ends up including our static stylesheet correctly.
// See https://nextjs.org/docs/app/building-your-application/styling/css-modules#global-styles.
import './style.css'

export default async function RootLayout({ children }) {
  if (newrelic.agent.collector.isConnected() === false) {
    await new Promise((resolve) => {
      newrelic.agent.on("connected", resolve)
    })
  }

  const browserTimingHeader = newrelic.getBrowserTimingHeader({
    hasToRemoveScriptWrapper: true,
    allowTransactionlessInjection: true,
  })

  return (
    <html>
    <body>
    <ul className="navbar">
      <li><a href="/">Home</a></li>
      <li><Link href="/users" key={"users"}>Users</Link></li>
      <li><Link href="/about" key={"about"}>About</Link></li>
    </ul>
    {children}

    <Script
      // We have to set an id for inline scripts.
      // See https://nextjs.org/docs/app/building-your-application/optimizing/scripts#inline-scripts
      id="nr-browser-agent"
      // By setting the strategy to "beforeInteractive" we guarantee that
      // the script will be added to the document's `head` element.
      strategy="beforeInteractive"
      // The body of the script element comes from the async evaluation
      // of `getInitialProps`. We use the special
      // `dangerouslySetInnerHTML` to provide that element body. Since
      // it requires an object with an `__html` property, we pass in an
      // object literal.
      dangerouslySetInnerHTML={{__html: browserTimingHeader}}
    />
    </body>
    </html>
  )
}
