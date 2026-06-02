'use strict'

const path = require('node:path')
const { defineConfig } = require('prisma/config')

module.exports = defineConfig({
  schema: path.resolve(__dirname, 'prisma/schema.prisma'),
  migrations: {
    path: 'prisma/migrations',
    seed: `node ${path.resolve(__dirname, 'prisma/seed.js')}`
  },
  datasource: {
    url: process.env.DATABASE_URL
  }
})
