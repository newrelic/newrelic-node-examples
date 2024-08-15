/*
 * Copyright 2022 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

// This is the file which uses our web framework.

const { SimpleFramework } = require('./simple-framework')
const { authenticate } = require('./lib/authenticate')

const getUsers = () => {
  const users = [
    { id: 1, username: 'user1', email: 'user1@example.com' },
    { id: 2, username: 'user2', email: 'user2@example.com' },
    { id: 3, username: 'user3', email: 'user3@example.com' }
  ];

  return JSON.stringify(users);
}

let server = new SimpleFramework()

server.all(function authenticateMiddleware(req, res) {
  if (authenticate()) {
    console.log("Authenticated!")
  } else {
    res.statusCode = 403
    res.end()
  }
})

server.get('/api/users', function(req, res) {
  res.write(getUsers())
  res.end()
})

server.get('/home', function(req, res) {
  const renderedView = server.render('home')
  res.write(renderedView)
  res.end()
})

server.start(3000)
