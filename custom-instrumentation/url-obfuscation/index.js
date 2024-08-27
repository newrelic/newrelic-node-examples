'use strict'
const newrelic = require('newrelic')


async function main() {
  await newrelic.startBackgroundTransaction('bg-tx', async() => {
    const { status } = await fetch('https://httpbin.org/anything/myemail@domain.com')
    console.log(`Done making request, status code: ${status}`)
  })
  newrelic.shutdown({ collectPendingData: true }, () => process.exit(0))
}

main()
