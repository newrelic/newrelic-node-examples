import { NextRequest, NextResponse } from 'next/server'
import newrelic from 'newrelic'
import getDatabase from '../../../../lib/database'

type RouteContext = {
  params: {
    id: string
  }
}

// GET /api/users/:id
export async function GET(
  req: NextRequest,
  { params }: RouteContext
) {
  const db = await getDatabase()
  const user = db.userById(params.id)

  return NextResponse.json(user)
}

// POST /api/users/:id
export async function POST(
  req: NextRequest,
  { params }: RouteContext
) {
  const db = await getDatabase()
  const dbUser = db.userById(params.id)

  if (!dbUser) {
    // Log the missing user to New Relic as a traced error
    newrelic.noticeError(new Error('user not found'))

    return NextResponse.json('user not found', { status: 404 })
  }

  const payload: {
    firstName: string
    lastName: string
    age: number
  } = await req.json()

  if (dbUser.age !== payload.age) {
    return NextResponse.json('updating age is not implemented', {
      status: 501,
    })
  }

  dbUser.firstName = payload.firstName
  dbUser.lastName = payload.lastName

  db.updateUserById(dbUser.id, dbUser)

  return NextResponse.json(dbUser, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
