// See https://nextjs.org/docs/pages/building-your-application/data-fetching/forms-and-mutations

import logger from '../../../lib/logger.js'
import getDatabase from '../../../lib/database.js'

// See https://react.dev/reference/react/useState
import { useState } from 'react'

export default function Page({ user }) {
  const [errorState, setErrorState] = useState(null)

  async function onSubmit(event) {
    event.preventDefault()
    try {
      const response = await fetch("/api/users/" + user.id, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          firstName: event.target.firstName.value,
          lastName: event.target.lastName.value,
          age: event.target.age.value
        })
      })

      if (response.ok !== true) {
        throw Error('Failed to update the data: ' + await response.text())
      }
    } catch (error) {
      setErrorState(error.message)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <p>
        Try updating any of the fields. An update to the &quot;age&quot; field
        will result in an error.
      </p>
      {errorState && <p style={{ color: 'red' }}>{errorState}</p>}
      <div>
        <label htmlFor={"user.firstName"}>First name: </label>
        <input id={"user.firstName"} name={"firstName"} defaultValue={user.firstName}></input>
      </div>
      <div>
        <label htmlFor={"user.lastName"}>Last name: </label>
        <input id={"user.lastName"} name={"lastName"} defaultValue={user.lastName}></input>
      </div>
      <div>
        <label htmlFor={"user.age"}>Age: </label>
        <input id={"user.age"} name={"age"} defaultValue={user.age}></input>
      </div>

      <button type="submit">Update</button>
    </form>
  )
}

export async function getServerSideProps(context) {
  logger.info('rendering user page')
  const db = await getDatabase()
  const user = db.userById(context.params.id)

  if (user === undefined) {
    logger.error('cannot find user with id: %s', context.params.id)
    return { notFound: true }
  }

  return {
    props: { user }
  }
}
