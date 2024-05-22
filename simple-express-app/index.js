const express = require('express')
const app = express()
const { PORT = 3000 } = process.env
const lib = require('@aws-sdk/client-sns')
const sns = new lib.SNSClient()

app.get('/named-route', (req, res) => {
  fetch('https://requestbin.myworkato.com/1hisp3d1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: Buffer.from(`{"fizz":"buzz"}`)
  })
  .then((response) => {
    return response.text()
  }).then((data) => {
    res.send(data)
  })
})

app.get('/sns', async (req, res) => {
  const cmd = new lib.ListTopicsCommand({})
  const result = await sns.send(cmd)
  res.send(result)

})

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))

