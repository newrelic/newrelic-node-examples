/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const env = process.env.NODE_ENV || 'development'
const knexfile = require('../knexfile')
const knex = require('knex')(knexfile[env])

module.exports = knex
