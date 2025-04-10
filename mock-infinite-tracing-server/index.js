const protoLoader = require('@grpc/proto-loader')
const grpc = require('@grpc/grpc-js')
const pkgDef = protoLoader.loadSync('./inifinite-trace.proto', {
 keepCase: true,
 longs: String,
 enums: String,
 defaults: true,
 oneofs: true
});

const proto = grpc.loadPackageDefinition(pkgDef)
const traceApi = proto.com.newrelic.trace.v1
const failCount = process.env.NR_FAIL_N_CALLS ?? 10
const fails = process.env.NR_FAILS ?? false
const serverTimeout = process.env.NR_TIMEOUT ?? 30000
let calls = 0
let spans = 0
const errorResponse = { code: 14, message: 'intentional failure'}
const okResponse = { code: 0, message: 'OK'}

/**
 * Handles processing of spans. If `NR_FAILS` is true
 * it'll fail every 10 calls of value of `NR_FAIL_N_CALLS`.
 * It keeps a tally of total spans processed during the life of the process.
 *
 * It also simulates the real server by ending the stream every 30 seconds or
 * configurable via `NR_TIMEOUT`.
 */
function abstractHandler(method, call) {
  console.log(method)
  call.on('data', (clientStream) => {
    if (fails && calls % failCount === 0) {
      calls++
      console.log('emit error')
      call.emit('error', errorResponse) 
      return
    }
    calls++
    const spansSeen = clientStream?.spans?.length ?? 1
    spans += spansSeen 
    // Reset the pendingStatus so subsequent calls are successful
    call.pendingStatus = okResponse 
    console.log(`processed ${spans} spans.`)
    call.write({ messages_seen: spansSeen })
  })
  
  setTimeout(() => {
    console.log('ending server stream')
    call.end()
  }, serverTimeout)
}

const infiniteTraceServer = {
  recordSpan: abstractHandler.bind(null, 'recordSpan'),
  recordSpanBatch: abstractHandler.bind(null, 'recordSpanBatch')
}

async function connect() {
  const server = new grpc.Server()
  const credentials = grpc.ServerCredentials.createInsecure()
  server.addService(traceApi.IngestService.service, infiniteTraceServer)
  await new Promise((resolve, reject) => {
    server.bindAsync('0.0.0.0:50051', credentials, (err, port) => {
      if (err) {
        reject(err)
      } else resolve(port)
    })
  })
  console.log('started at localhost:50051!')
}

connect()

