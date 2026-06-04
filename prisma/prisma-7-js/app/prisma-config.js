/*
 * Copyright 2026 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const path = require('node:path')
// eslint-disable-next-line n/no-unpublished-require -- shhh, we don't care.
const { defineConfig } = require('prisma/config')

module.exports = defineConfig({
  schema: path.resolve(__dirname, 'prisma/schema.prisma'),
  migrations: {
    path: 'prisma/migrations',
    seed: `node ${path.resolve(__dirname, 'prisma/seed.js')}`
  },
  datasource: {
    url: process.env.DATABASE_URL
  }
})
