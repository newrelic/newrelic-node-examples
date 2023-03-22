/*
 * Copyright 2023 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const newrelic = require('newrelic')
const express = require('express')
const { interactWithAPI, interactWithDatabase } = require('./helpers')

const app = express()

newrelic.setErrorGroupCallback(function groupErrors(errMetadata) {
  let errorGroup

  if (errMetadata['error.expected']) {
    if (errMetadata.error?.component === 'api') {
      errorGroup = 'Expected API Error'
    }

    if (errMetadata.error?.component === 'database') {
      errorGroup = 'Expected Database Error'
    }
  } else {
    if (errMetadata.error?.component === 'api') {
      errorGroup = 'Unexpected API Error'
    }

    if (errMetadata.error?.component === 'database') {
      errorGroup = 'Unexpected Database Error'
    }
  }

  return errorGroup
})

app.get('/error/expected', function expectedController(_req, res) {
  return Promise.all([interactWithAPI(), interactWithDatabase()])
    .catch((err) => {
      if (err.isExpected) {
        newrelic.noticeError(err, err.metadata, true)
      } else {
        newrelic.noticeError(err, err.metadata, false)
      }
    })
    .finally(() => {
      return res.status(200).json({ message: 'OK' })
    })
})

app.get('/error/unexpected', function unexpectedController(_req, res) {
  return Promise.all([interactWithAPI(), interactWithDatabase()])
    .then(() => {
      return res.status(200).json({ message: 'OK' })
    })
    .catch((err) => {
      return res.status(500).json({ message: err.message })
    })
})

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server listening on port 3000')
})
