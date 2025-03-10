'use strict'
module.exports = async function lambdaHandler() {
  const req = await new Promise((resolve) => {
    resolve({"hello": "world"})
  })
  return req
}
