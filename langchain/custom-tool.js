/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const { Tool } = require('@langchain/core/tools')
const data = {
  langchain: { response: 'Langchain is the best!' },
  bridge: { response: 'A bridge is a structure linking two places elevated over another.' },
  smidge: { response: 'A smidge is a small amount of something.' },
  midge: { response: 'A midge is a tiny flying insect.' },
  tunnel: { response: 'A tunnel is a passage which allows access underground or through an elevated geographic feature or human-made structure.' },
  chunnel: { response: 'The Chunnel is a tunnel under the English Channel.' },
  funnel: { response: 'A funnel is a shape consisting of a partial cone and a cylinder, for directing solids or fluids from a wider to a narrower opening.' }
}

module.exports = class TestTool extends Tool {
  static lc_name() {
    return 'TestTool'
  }

  name = 'node-agent-test-tool'
  description = 'A test tool for LangChain'
  key

  constructor(params) {
    super()
    this.baseUrl = params.baseUrl ?? this.baseUrl
    this.fakeData = data
  }

  async _call(key) {
    if (this.fakeData[key]) {
      return this.fakeData[key]
    }
    throw new Error('Failed to retrieve data')
  }
}
