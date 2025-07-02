'use strict'

const {
  fetchAllCounter,
  fetchCrossCounter
} = require('../otel/metrics')

const fetchAll = async (req, res, next) => {
  fetchAllCounter.add(1)

  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts?foo=bar&baz=bat')
    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error('Error fetching data:', error)
    next(error)
  }
}

const fetchCross = async (req, res, next) => {
  fetchCrossCounter.add(1)

  try {
    const port = req.headers.host.includes('3000') ? 3001 : 3000
    const response = await fetch(`http://localhost:${port}/fetch`)
    const data = await response.json()
    res.json(data)
  } catch (error){
    console.error('Error fetching data:', error)
    next(error)
  }
}

module.exports = {
  fetchAll,
  fetchCross
}
