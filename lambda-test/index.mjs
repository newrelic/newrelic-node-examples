'use strict'
const mode = process.env.FUNCTION_MODE
import * as asyncHandler from './handlers/async.js'
import * as cbHandler from './handlers/cb.js'
import * as contextHandler from './handlers/context.js'
import * as streamHandler from './handlers/streaming.js'
let lambdaHandler

console.log('RUNNING LAMBDA IN MODE', mode)

switch(mode) {
  case 'async':
    lambdaHandler = asyncHandler.default
    break;
  case 'cb':
    lambdaHandler = cbHandler.default
    break;
  case 'context':
    lambdaHandler = contextHandler.default
    break;
  case 'streaming':
    lambdaHandler = streamHandler.default
    break;
  default:
    lambdaHandler = asyncHandler.default
}

debugger
const handler = lambdaHandler
export { handler }
