const express = require('express')
const app = express()
const { PORT = 3000 } = process.env

app.get('/named-route', (req, res) => {
  res.send('hi')
})

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))

