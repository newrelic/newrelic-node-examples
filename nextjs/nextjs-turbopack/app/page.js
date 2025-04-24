import logger from '../lib/logger'

export default function Index() {
  logger.info('rendering index page')

  return <div>
    <p>
      This application shows how to instrument Next.js applications with
      the New Relic Node.js agent for server-side instrumentation, along
      with the browser agent for client-side instrumentation.
    </p>
    <p>
      This application provides a basic interface to a database of users.
      Each user can be inspected and updated in order to show how the
      instrumentation works.
    </p>
    <ul>
      <li>The <a href={"/users"}>Users</a> page provides a list users.</li>
      <li>Clicking on a user goes to the user update page.</li>
      <li>Updating a user&apos;s first or last name will result in a successful transaction.</li>
      <li>Updating a user&apos;s age will demonstrate an error condition.</li>
    </ul>
  </div>
}
