'use strict'
const newrelic = require('newrelic')
const mode = process.env.FUNCTION_MODE
const agentEnabled = process.env.NEW_RELIC_ENABLED 
const asyncHandler = require('./handlers/async')
const cbHandler = require('./handlers/cb')
const contextHandler = require('./handlers/context')
const streamHandler = require('./handlers/streaming')
let lambdaHandler

console.log('RUNNING LAMBDA IN MODE', mode)

switch(mode) {
  case 'async':
    lambdaHandler = asyncHandler
    break;
  case 'cb':
    lambdaHandler = cbHandler
    break;
  case 'context':
    lambdaHandler = contextHandler
    break;
  case 'streaming':
    lambdaHandler = streamHandler
    break;
  default:
    lambdaHandler = asyncHandler
}

if (agentEnabled === 'true') {
  module.exports.handler = newrelic.setLambdaHandler(lambdaHandler)
} else {
  module.exports.handler = lambdaHandler
}
