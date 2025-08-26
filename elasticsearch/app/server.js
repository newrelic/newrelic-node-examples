/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

const express = require('express')
const app = express()
const port = 3000

app.get('/es-demo', (req, res) => {
  res.status(200).json({ message: 'Elasticsearch Skeleton reporting for duty! 💀' })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
