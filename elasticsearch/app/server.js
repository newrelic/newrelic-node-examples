const express = require('express')
const app = express()
const port = 3000

app.get('/es-demo', (req, res) => {
  res.status(200).json({ message: 'Elasticsearch Skeleton reporting for duty! 💀'})
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})