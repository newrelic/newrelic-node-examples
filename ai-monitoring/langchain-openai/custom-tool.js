/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const { tool } = require('@langchain/core/tools')
const { z } = require('zod')

const data = {
  langchain: 'Langchain is the best!',
  bridge: 'A bridge is a structure linking two places elevated over another.',
  smidge: 'A smidge is a small amount of something.',
  midge: 'A midge is a tiny flying insect.',
  tunnel: 'A tunnel is a passage which allows access underground or through an elevated geographic feature or human-made structure.',
  chunnel: 'The Chunnel is a tunnel under the English Channel.',
  funnel: 'A funnel is a shape consisting of a partial cone and a cylinder, for directing solids or fluids from a wider to a narrower opening.'
}

const testTool = tool(
  async (input) => {
    const { key } = input
    if (data[key]) {
      return data[key]
    }
    throw new Error(`Failed to retrieve data for key: ${key}`)
  },
  {
    name: 'node-agent-test-tool',
    description: 'Retrieves test data for a given key. Available keys: langchain, bridge, smidge, midge, tunnel, chunnel, funnel',
    schema: z.object({
      key: z.string().describe('The key to look up in the test data')
    })
  }
)

module.exports = { testTool }
