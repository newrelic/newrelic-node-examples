/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { User } = require('../models')
const {
  createError,
  BAD_REQUEST,
  UNAUTHORIZED
} = require('../helpers/error_helper')
const {
  authPostLoginCounter,
  authPostRegisterCounter
} = require('../otel/metrics')

const postLogin = (req, res, next) => {
  authPostLoginCounter.add(1)

  const username = String(req.body.username)
  const password = String(req.body.password)

  if (!username || !password) {
    next(createError({
      status: BAD_REQUEST,
      message: '`username` + `password` are required fields'
    }))
  }

  User.verify(username, password)
    .then((user) => res.json({
      ok: true,
      message: 'Login successful',
      user
    }))
    .catch((err) => next(createError({
      status: UNAUTHORIZED,
      message: err
    })))
}

const postRegister = (req, res, next) => {
  authPostRegisterCounter.add(1)

  const props = req.body.user

  User.findOne({ username: props.username })
    .then((user) => {
      if (user) {
        return next(createError({
          status: CONFLICT,
          message: 'Username already exists'
        }))
      }

      return User.create(props)
    })
    .then((user) => res.json({
      ok: true,
      message: 'Registration successful',
      user
    }))
    .catch(next)
}

module.exports = {
  postLogin,
  postRegister
}
