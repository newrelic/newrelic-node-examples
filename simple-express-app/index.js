const express = require('express')
const app = express()
const { PORT = 3000 } = process.env
const lib = require('@aws-sdk/client-sns')
const sns = new lib.SNSClient()

app.get('/named-route', (req, res) => {
  res.send('hi')
})

app.get('/sns', async (req, res) => {
  const cmd = new lib.ListTopicsCommand({})
  const result = await sns.send(cmd)
  res.send(result)

})

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))

