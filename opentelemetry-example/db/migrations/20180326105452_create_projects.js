/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

exports.up = (knex) => knex.schema.createTable('projects', (t) => {
  t.increments('id').primary().unsigned()
  t.integer('user_id').references('users.id').unsigned().index().onDelete('CASCADE')
  t.string('name')
  t.text('description')
  t.timestamp('completed_at')
  t.timestamp('created_at').defaultTo(knex.fn.now())
  t.timestamp('updated_at').defaultTo(knex.fn.now())
})

exports.down = (knex) => knex.schema.dropTable('projects')
