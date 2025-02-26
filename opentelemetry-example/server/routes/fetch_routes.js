'use strict'

const router = require('express').Router()
const {
  fetchAll,
  fetchCross
} = require('../controllers/fetch_controller')

const {
  httpAll,
  httpCross,
} = require('../controllers/http_controller')

router.route('/fetch')
  .get(fetchAll)

router.route('/fetch-dt')
  .get(fetchCross)

router.route('/http')
  .get(httpAll)

router.route('/http-dt')
  .get(httpCross)

module.exports = router
