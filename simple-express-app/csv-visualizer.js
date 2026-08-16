/*
 * Copyright 2026 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

const fs = require('node:fs/promises')
const path = require('path')
const express = require('express')
const app = express()
const PORT = 3001
const monitorDir = path.join(__dirname, 'monitor-data')

app.use(express.static(path.join(__dirname, 'public')))

// List all CSV files in the directory
app.get('/csv-list', async (req, res) => {
  const contents = await fs.readdir(monitorDir)
  const files = contents.filter((file) => file.endsWith('.csv'))
  res.json(files)
})

// Fetch CSV data for a given file
app.get('/data', async (req, res) => {
  const file = req.query.file
  if (!file || !file.endsWith('.csv')) {
    res.status(400).send('Invalid CSV file')
    return
  }

  let csvPath
  try {
    csvPath = await fs.realpath(path.resolve(monitorDir, file))
  } catch (err) {
    res.status(404).send(`Failed to find file ${err.message}`)
    return
  }

  const csv = await fs.readFile(csvPath, 'utf8')
  const lines = csv.trim().split('\n')
  const headers = lines.shift().split(',')
  // formats the data into a collection:
  // [
  //  { timestamp, cpu_user_ms, cpu_system_ms, etc }
  // ]
  const data = lines.map((line) => {
    const values = line.split(',')
    const obj = {}
    headers.forEach((h, i) => {
      obj[h] = values[i]
    })
    return obj
  })
  res.json({ headers, data })
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`CSV visualizer running at http://localhost:${PORT}`)
})
