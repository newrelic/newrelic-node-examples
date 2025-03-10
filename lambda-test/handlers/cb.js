'use strict'
module.exports = function lambdaHandler(event, context, cb) {
  cb(null, { "hello": "world"})
}
