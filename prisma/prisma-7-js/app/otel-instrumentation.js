/*
 * Copyright 2026 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { registerInstrumentations } = require('@opentelemetry/instrumentation')
const { PrismaInstrumentation } = require('@prisma/instrumentation')

registerInstrumentations({
  instrumentations: [
    new PrismaInstrumentation()
  ]
})
