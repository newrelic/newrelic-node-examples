'use strict'

const newrelic = require('newrelic')
const url = require('url')
const http = require('http')
// Construct a schema, using GraphQL schema language

const source = `
query {
  books {
    name
    authors {
      name
      address {
        country
      }
    }
  }
}
`

async function main() {
  await newrelic.startBackgroundTransaction('send-request', async () => {
    const txn = newrelic.getTransaction()
    const res = await makeRequest(source)
    console.log(res)
    txn.end()
  })
      
  newrelic.shutdown({ collectPendingData: true }, () => process.exit(0))
}

function makeRequest(query) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new url.URL('http://localhost:4000/graphql')
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }

    const req = http.request(options, (res) => {
      const data = []
      res.on('data', (chunk) => data.push(chunk))
      res.on('end', () => {
        resolve(data.toString())
      })
      res.on('error', (err) => {
        reject(err)
      })
    })

    req.write(JSON.stringify({ query }))
    req.end()
  })
}

main()
