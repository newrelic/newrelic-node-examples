/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

exports.up = (knex) => knex.schema.createTable('users', (t) => {
  t.increments('id').primary().unsigned()
  t.string('username').unique().index()
  t.string('password')
  t.string('email').unique().index()
  t.timestamp('created_at').defaultTo(knex.fn.now())
  t.timestamp('updated_at').defaultTo(knex.fn.now())
})

exports.down = (knex) => knex.schema.dropTable('users')
