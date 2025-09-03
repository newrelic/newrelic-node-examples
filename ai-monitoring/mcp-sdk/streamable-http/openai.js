/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

const { Agent, run, MCPServerStreamableHttp } = require('@openai/agents')
const newrelic = require('newrelic')

async function main() {
  const mcpServer = new MCPServerStreamableHttp({
    url: 'https://gitmcp.io/openai/codex',
    name: 'GitMCP Documentation Server',
  })
  const agent = new Agent({
    name: 'GitMCP Assistant',
    instructions: 'Use the tools to respond to user requests.',
    mcpServers: [mcpServer],
  })

  try {
    await newrelic.startBackgroundTransaction('openai-example', async () => {
      const txn = newrelic.getTransaction()
      await mcpServer.connect()
      const result = await run(
        agent,
        'Which language is this repo written in?'
      )
      console.log(result.finalOutput)
      txn.end()
    })
  } finally {
    newrelic.shutdown({ collectPendingData: true }, async () => {
      await mcpServer.close()
    })
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
