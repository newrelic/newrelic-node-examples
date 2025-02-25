'use strict'

const router = require('express').Router()
const {
    fetchAll,
    fetchCross
  } = require('../controllers/fetch_controller')
  
  router.route('/fetch')
    .get(fetchAll)

  router.route('/fetch-dt')
    .get(fetchCross)
  
  module.exports = router
  