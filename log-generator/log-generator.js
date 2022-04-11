#!/usr/bin/env node

/*
 * Copyright 2022 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

process.env.NEW_RELIC_NO_CONFIG_FILE = true
process.env.NEW_RELIC_APP_NAME = 'log-generator'
process.env.NEW_RELIC_LICENSE_KEY = 'fill-in-license-key'

const newrelic = require('newrelic')

const yargs = require('yargs')
const { hideBin } = require('yargs/helpers')
const faker = require('faker')

function getArgs() {
  return yargs(hideBin(process.argv))
    .scriptName('log-generator')
    .usage(
      'Usage: $0 OPTIONS\n\nstarts a process that will generate logs with either winston or pino'
    )
    .option('logtype', {
      alias: 'l',
      describe: 'which logger to use',
      choices: ['winston', 'pino'],
      type: 'string'
    })
    .demandOption(['logtype'], 'specify which logger to use')
    .option('interval', {
      alias: 'i',
      describe: 'interval in milliseconds to wait between each round of log messages',
      default: 200,
      type: 'number'
    })
    .option('count', {
      alias: 'c',
      describe: 'number of log messages to produce at each round',
      default: 1,
      type: 'number'
    })
    .option('size', {
      alias: 's',
      describe: 'size of each log message, in characters',
      default: 128,
      type: 'number'
    })
    .help().argv
}

function getLogger(logtype) {
  let logger
  if (logtype === 'winston') {
    const newrelicFormatter = require('@newrelic/winston-enricher')

    const { createLogger, format, transports } = require('winston')
    logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json(),
        newrelicFormatter()
      ),
      defaultMeta: { service: 'log-generator' },
      transports: [new transports.Console()]
    })
  } else {
    const nrPino = require('@newrelic/pino-enricher')
    const pino = require('pino')
    logger = pino(nrPino())
  }

  return logger
}

function runOneBatchOfLogs(logger, interval, count, size) {
  return new Promise((resolve) => {
    setTimeout(() => {
      for (let i = 0; i < count; i++) {
        logger.info(faker.random.alphaNumeric(size))
      }
      resolve()
    }, interval)
  })
}

function run(logger, interval, count, size) {
  newrelic.startBackgroundTransaction('loggingTransaction', () => {
    runOneBatchOfLogs(logger, interval, count, size).then(() => {
      run(logger, interval, count, size)
    })
  })
}

const { logtype, interval, count, size } = getArgs()
const logger = getLogger(logtype)

run(logger, interval, count, size)
