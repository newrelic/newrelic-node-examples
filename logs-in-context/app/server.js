const start = async() => {
  const { PORT = 3000, HOST = 'localhost', WINSTON } = process.env
  let logger
  if (WINSTON) {
    const nrWinston = require('@newrelic/winston-enricher')
    const winston = require('winston')
    logger = winston.createLogger({
      levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        trace: 4,
        debug: 5
      },
      level: 'info',
      format: nrWinston(),
      transports: [
        new winston.transports.Console()
      ]
    })
  } else {
    const nrPino = require('@newrelic/pino-enricher')
    const pino = require('pino')
    logger = pino(nrPino())
  }
  const fastify = require('fastify')({ logger, disableRequestLogging: true })

  fastify.get('/', async (request, reply) => {
    fastify.log.info('delaying request')
    await new Promise((resolve) => {
      setTimeout(() => {
        fastify.log.info('delay done')
        resolve()
      }, 2000)
    })
    fastify.log.info('sending response')
    reply.send({ hello: 'world' })
  })

  await fastify.listen(PORT, HOST)
}

start()
