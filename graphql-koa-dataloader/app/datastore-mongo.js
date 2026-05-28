/*
 * Copyright 2023 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { MongoClient } = require('mongodb')
const { generateUsers } = require('./utils')

async function initData() {
  const client = new MongoClient(process.env.MONGO_URL)
  try {
    await client.connect()
    const allUsers = generateUsers(10)
    const db = client.db('users')
    const friends = db.collection('friends')
    await friends.deleteMany()

    const result = await friends.insertMany(allUsers, { ordered: true })
    console.log(`${result.insertedCount} users were created`)
  } finally {
    client.close()
  }
}

async function getUserById(id) {
  console.log(`Fetch user #${id}`)
  const client = new MongoClient(process.env.MONGO_URL)
  try {
    await client.connect()
    const db = client.db('users')
    const friends = db.collection('friends')
    const result = await friends.findOne({ _id: id })
    console.log(result)
    return result
  } finally {
    client.close()
  }
}

module.exports = { getUserById, initData }
