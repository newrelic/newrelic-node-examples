'use strict'

const env = process.env.NODE_ENV || 'development'
const knexfile = require('../knexfile')
debugger
const knex = require('knex')(knexfile[env])

module.exports = knex
