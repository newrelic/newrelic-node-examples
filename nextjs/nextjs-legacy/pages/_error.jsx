// This customization of Next.js's default error page allows us to send
// unexpected errors to New Relic so that they can be viewed in the dashboard.
//
// See https://nextjs.org/docs/pages/building-your-application/routing/custom-error#more-advanced-error-page-customizing

function Error({ statusCode }) {
  return (
    <p>
      {statusCode
        ? `An error ${statusCode} occurred on server`
        : 'An error occurred on client'}
    </p>
  )
}

Error.getInitialProps = async function ({ res, err }) {
  if (typeof window === 'undefined') {
    // The error has occurred on the server-side. So we utilize the standard
    // Node.js module for reporting the error.
    const newrelic = await import('newrelic')
    newrelic.noticeError(err)
  } else {
    // The error has occurred on the client-size. So we utilize the browser
    // agent to report the error.
    window.newrelic.noticeError(err)
  }

  let statusCode
  if (res) {
    statusCode = res.statusCode
  } else {
    statusCode = err?.statusCode || 404
  }
  return { statusCode }
}

export default Error
