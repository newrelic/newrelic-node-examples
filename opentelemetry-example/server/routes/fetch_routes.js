'use strict'

const router = require('express').Router()
const {
    fetchAll,
  } = require('../controllers/fetch_controller')
  
  router.route('/fetch')
    .get(fetchAll)
  
  module.exports = router
  