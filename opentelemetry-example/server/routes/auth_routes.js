/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const router = require('express').Router()
const {
  postLogin,
  postRegister
} = require('../controllers/auth_controller')

router.route('/login')
  .post(postLogin)

router.route('/register')
  .post(postRegister)

module.exports = router
