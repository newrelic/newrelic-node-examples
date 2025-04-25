'use client'
// If instrumenting client pages, do not import or require the New Relic APM agent. 
// Instead, use the New Relic Browser agent to instrument client pages. See below. 

// See https://nextjs.org/docs/pages/building-your-application/data-fetching/client-side#client-side-data-fetching-with-useeffect
// See https://react.dev/reference/react/useState
import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'

export default function Page({ params }) {
  const [user, setUser] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [errorState, setErrorState] = useState(null)
  useEffect(() => {
    fetch(
        `/api/users/${params.id}`,
        { method: 'GET' }
      )
      .then(r => r.json())
      .then(user => {
        setUser(user)
        setLoading(false)
      })
    }
    , [])

  if (isLoading === true) return <p>Loading...</p>
  if (!user) return notFound()

  // Instrumenting client pages:
  // Using New Relic API methods in client pages will require the New Relic Browser Agent, 
  // which is available on the global `window` object:
  // window.newrelic.setCustomAttribute("customAttribute", 'custom attribute value')

  async function onSubmit(event) {
    event.preventDefault()
    try {
      const response = await fetch(`/api/users/${user.id}`, {
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
