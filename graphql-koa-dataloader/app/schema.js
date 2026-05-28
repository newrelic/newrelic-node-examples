/*
 * Copyright 2023 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const gql = require('graphql-tag')

const userSchema = gql`
  type Query {
    user(id: Int!): User
    allUsers: [User]
  }

  type User {
    age: Int!
    email: String!
    hobbies: [String!]
    id: Int!
    name: String!
    friends: [Int!]
  }
`

module.exports = userSchema
