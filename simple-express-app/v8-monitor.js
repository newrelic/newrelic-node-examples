/*
 * Copyright 2026 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

const fs = require('node:fs/promises')
const path = require('node:path')

const SAMPLE_INTERVAL = 1000 // ms
const WARMUP_DURATION = 5000 // ms (default warmup)
const OUTPUT_FILE = `v8-monitor-${Date.now()}.csv`
const MONITORING_DIR = path.join(__dirname, 'monitor-data')
const FILE_PATH = path.join(MONITORING_DIR, OUTPUT_FILE)

function getCpuUsage(prevCpu) {
  // Get CPU usage delta from process
  const usage = process.cpuUsage(prevCpu)
  const formatted = {
    user: usage.user / 1000,
    system: usage.system / 1000,
  }
  return {
    raw: usage,
    formatted,
  }
}

function getMemoryUsage() {
  const mem = process.memoryUsage()
  return {
    rss: mem.rss,
    heapTotal: mem.heapTotal,
    heapUsed: mem.heapUsed,
  }
}

async function writeHeader() {
  try {
    await fs.mkdir(MONITORING_DIR)
  } catch {}

  const header = [
    'timestamp',
    'cpu_user_ms',
    'cpu_system_ms',
    'cpuUserPercent',
    'cpuSystemPercent',
    'rss',
    'heapTotal',
    'heapUsed',
    'heapUsedPercent',
  ].join(',') + '\n'

  return fs.writeFile(FILE_PATH, header)
}

async function writeSample(data) {
  const heapUsedPercent = data.memory.heapTotal > 0 ? (data.memory.heapUsed / data.memory.heapTotal) * 100 : 0
  // cpu.user and cpu.system are now percent per core
  const cpuUserPercent = data.cpu.user
  const cpuSystemPercent = data.cpu.system
  const line = [
    data.timestamp,
    data.cpu.user,
    data.cpu.system,
    cpuUserPercent,
    cpuSystemPercent,
    data.memory.rss,
    data.memory.heapTotal,
    data.memory.heapUsed,
    heapUsedPercent,
  ].join(',') + '\n'
  return fs.appendFile(FILE_PATH, line)
}

let running = false
async function main() {
  // eslint-disable-next-line no-console
  console.log(`Warming up for ${WARMUP_DURATION} ms...`)
  await writeHeader()
  setTimeout(() => {
    running = true
    const prevCpu = process.cpuUsage()
    process.on('SIGINT', () => {
      running = false
      // eslint-disable-next-line no-console
      console.log('Stopped monitoring.')
    })

    // eslint-disable-next-line no-console
    console.log('Starting sampling')
    sample({ prevCpu })
  }, WARMUP_DURATION)
}

async function sample({ prevCpu }) {
  const now = new Date().toISOString()
  // Calculate CPU delta since last sample
  const cpuUsage = getCpuUsage(prevCpu)
  // Update prevCpu to the current snapshot for next interval
  prevCpu = process.cpuUsage()
  const memory = getMemoryUsage()
  // CPU percent per core
  const intervalMicros = SAMPLE_INTERVAL * 1000
  const cpu = {
    user: (cpuUsage.raw.user / intervalMicros) * 100,
    system: (cpuUsage.raw.system / intervalMicros) * 100,
  }
  await writeSample({ timestamp: now, cpu, memory })
  if (running) {
    setTimeout(sample.bind(null, { prevCpu }), SAMPLE_INTERVAL)
  }
}

main()
