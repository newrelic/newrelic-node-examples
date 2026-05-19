/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextResponse } from 'next/server'

import getDatabase from '../../../../lib/database'

export async function GET(req, { params }) {
  const { id } = await params
  const db = await getDatabase()
  const user = db.userById(id)
  return NextResponse.json(user)
}

export async function POST(req, { params }) {
  const { id } = await params
  const db = await getDatabase()
  const dbUser = db.userById(id)

  if (!dbUser) {
    // We're trying to edit a non-existing user. This seems like
    // something we'd like to record so that it can be easily
    // viewed in the New Relic dashboard.
    //
    // newrelic is required lazily here rather than imported at the top of the
    // file. A top-level import initializes the agent when the module is loaded,
    // which happens during the build's static generation phase (before
    // --require newrelic is active), causing workers to stall.
    const newrelic = require('newrelic')
    newrelic.noticeError(Error('user not found'))
    return NextResponse.json('user not found', { status: 404 })
  }

  const payload = await req.json()
  // Coercive check: payload.age is a string from the form, dbUser.age is a number
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
