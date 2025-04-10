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
const fails = process.env.NR_FAILS
const serverTimeout = process.env.NR_TIMEOUT ?? 30000
let calls = 0

// Simply just reflect back the data getting passed from client stream
let spans = 0
const infiniteTraceServer = {
  recordSpan: function(call, cb) {
    console.log('recordSpan')
    call.on('data', () => {
      if (fails && calls % failCount === 0) {
        calls++
        call.emit('error', { code: 14, message: 'bob-test'})
        return
      }
      calls++
      spans++
      call.pendingStatus = { code: 0 , details: 'OK'}
      console.log(`processed ${spans} spans thus far`)
      call.write({ messages_seen: 1 })
    })
    
    setTimeout(() => {
      console.log('calling server stream end')
      call.end()
    }, serverTimeout)
  },
  recordSpanBatch: function(call, cb) {
    console.log('recordSpanBatch')
    call.on('data', (clientStream) => {
      if (fails && calls % failCount === 0) {
        calls++
        console.log('emit error')
        call.emit('error', {
          code: 14,
          message: 'bob-test'
        })
        return
      }
      calls++
      call.pendingStatus = { code: 0 , details: 'OK'}
      spans += clientStream.spans.length
      console.log(`processed ${spans} spans thus far`)
      call.write({ messages_seen: clientStream.spans.length })
    })

    setTimeout(() => {
      console.log('calling server stream end')
      call.end()
    }, serverTimeout)
  }
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

