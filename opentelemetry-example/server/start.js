/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const PORT = process.env.PORT || 3000

const app = require('../server')

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
}).on('error', (err) => {
  console.log('ERROR: ', err)
})
