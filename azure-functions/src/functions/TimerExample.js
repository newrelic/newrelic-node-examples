/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

const { app } = require('@azure/functions')

app.timer('TimerExample', {
  schedule: '0 */5 * * * *',
  handler: (myTimer, context) => {
    context.log('Timer function processed request.')
  }
})
