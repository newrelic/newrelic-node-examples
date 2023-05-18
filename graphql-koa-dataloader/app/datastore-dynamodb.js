/*
 * Copyright 2023 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DynamoDBClient as Client,
  CreateTableCommand,
  DeleteTableCommand,
  waitUntilTableExists,
  waitUntilTableNotExists
} from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { generateUsers } from './utils.js'

const tableParams = {
  AttributeDefinitions: [
    {
      AttributeName: 'id',
      AttributeType: 'N'
    }
  ],
  KeySchema: [
    {
      AttributeName: 'id',
      KeyType: 'HASH'
    }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  },
  TableName: 'Users',
  StreamSpecification: {
    StreamEnabled: false
  }
}

async function initData() {
  const client = new Client({})
  try {
    console.log('Deleting table...')
    await client.send(new DeleteTableCommand({ TableName: 'Users' }))
    await waitUntilTableNotExists({ client }, { TableName: 'Users' })
  } catch (err) {
    console.log(err.message)
  }
  console.log('Creating table...')
  await client.send(new CreateTableCommand(tableParams))
  await waitUntilTableExists({ client }, { TableName: 'Users' })

  console.log('Adding users...')
  const docClient = DynamoDBDocumentClient.from(client)
  const users = generateUsers(10)
  for (const user of users) {
    user.id = user._id
    await docClient.send(
      new PutCommand({
        TableName: 'Users',
        Item: user
      })
    )
  }
  console.log('added 10 users')
}

async function getUserById(id) {
  const client = DynamoDBDocumentClient.from(new Client({}))
  const { Item: item } = await client.send(
    new GetCommand({
      TableName: 'Users',
      Key: { id }
    })
  )
  return item
}

export { getUserById, initData }
