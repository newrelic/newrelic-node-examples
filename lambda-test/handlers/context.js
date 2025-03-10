'use strict'
module.exports = function lambdaHandler(event, context, cb) {
  return context.done(null, { "hello": "world"})
}
