/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const router = require('express').Router()
const {
  postUsers,
  getUsers,
  getUser,
  putUser,
  deleteUser
} = require('../controllers/user_controller')

router.route('/users')
  .post(postUsers)
  .get(getUsers)

router.route('/users/:id')
  .get(getUser)
  .put(putUser)
  .delete(deleteUser)

module.exports = router
