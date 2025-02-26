'use strict'
const http = require('http')
const https = require('https')

const httpAll = (req, res, next) => {

    https.get('https://jsonplaceholder.typicode.com/posts', (httpRes) => {
      let rawData = ''
      httpRes.on('data', (chunk) => rawData += chunk)
      httpRes.on('end', () => {
        const data = JSON.parse(rawData)
        res.json(data)
      })

      httpRes.on('error', (err) => {
        console.error(error)
        next(error)
      })
    })
}

const httpCross = async (req, res, next) => {
    const port = req.headers.host.includes('3000') ? 3001 : 3000
    http.get(`http://localhost:${port}/users`, (httpRes) => {
      let rawData = ''
      httpRes.on('data', (chunk) => rawData += chunk)
      httpRes.on('end', () => {
        const data = JSON.parse(rawData)
        res.json(data)
      })

      httpRes.on('error', (err) => {
        console.error(error)
        next(error)
      })
    })
}

module.exports = {
    httpAll,
    httpCross
}
