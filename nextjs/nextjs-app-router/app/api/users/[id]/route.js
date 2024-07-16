import { NextResponse } from 'next/server'

import newrelic from 'newrelic'
import getDatabase from '../../../../lib/database'

export async function GET(req, { params }) {
  const db = await getDatabase()
  const user = db.userById(params.id)
  return NextResponse.json(user)
}

export async function POST(req, { params }) {
  const db = await getDatabase()
  const dbUser = db.userById(params.id)

  if (!dbUser) {
    // We're trying to edit a non-existing user. This seems like
    // something we'd like to record so that it can be easily
    // viewed in the New Relic dashboard.
    newrelic.noticeError(Error('user not found'))
    return NextResponse.json('user not found', { status: 404 })
  }

  const payload = await req.json()
  if (dbUser.age != payload.age) {
    return NextResponse.json(
      'updating age is not implemented',
      { status: 501 }
    )
  }

  dbUser.firstName = payload.firstName
  dbUser.lastName = payload.lastName
  db.updateUserById(dbUser.id, dbUser)

  return NextResponse.json(dbUser, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
