const express = require('express')
const app = express()
const { PORT = 3000 } = process.env
const lib = require('@aws-sdk/client-sns')
const { Client } = require('pg')
const Cursor = require('pg-cursor')
const newrelic = require('newrelic')
const sns = new lib.SNSClient()

app.get('/named-route', (req, res) => {
  res.send('hi')
})

app.get('/sns', async (req, res) => {
  const cmd = new lib.ListTopicsCommand({})
  const result = await sns.send(cmd)
  res.send(result)
})

app.get('/pg-cursor', async (req, res) => {
  const client = new Client({
    connectionString: 'postgres://postgres:postgres@localhost:5432/postgres'
  })
  const TABLE = 'testTable-post'
  const TABLE_PREPARED = '"' + TABLE + '"'
  const PK = 'pk_column'
  const COL = 'test_column'
  try {
    await client.connect()
    await client.query(`CREATE TABLE IF NOT EXISTS ${TABLE_PREPARED} (${PK} SERIAL PRIMARY KEY, ${COL} TEXT)`)
    await seed()

    const cursor = client.query(new Cursor(`select * from ${TABLE_PREPARED}`))
    const result = await cursor.read(10)
    cursor.close()
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).send('Error fetching data')
  } finally {
    await client.end()
  }
  async function seed() {
    for (let i = 0; i < 10; i += 1) {
      await client.query(`insert into ${TABLE_PREPARED} (${PK}, ${COL}) values($1, $2)`, [i, `item ${i}`])
    }
  }
})

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))

