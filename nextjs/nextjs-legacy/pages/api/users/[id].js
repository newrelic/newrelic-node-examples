/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import logger from '../../../lib/logger.js'
import getDatabase from '../../../lib/database.js'

export default async function handler(req, res) {
  logger.info('handling request: %s %s', req.method, req.url)
  if (req.method !== 'POST') {
    return res.status(400).send('must use POST')
  }

  const db = await getDatabase()
  // Evidently, path parameters get added to the request's query parameters:
  const dbUser = db.userById(req.query.id)

  if (!dbUser) {
    return res.status(404).send('user not found')
  }

  const payload = req.body
  if (dbUser.age !== payload.age) {
    return res.status(501).send('updating age is not implemented')
  }

  dbUser.firstName = payload.firstName
  dbUser.lastName = payload.lastName
  db.updateUserById(dbUser.id, dbUser)

  return res.send()
}
