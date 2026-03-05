/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const express = require('express')
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.json())
app.disable('x-powered-by')

app.use('/', [
  require('./routes/auth_routes'),
  require('./routes/user_routes'),
  require('./routes/project_routes'),
  require('./routes/fetch_routes')
])

app.use(require('./middleware/error_middleware').all)

module.exports = app
