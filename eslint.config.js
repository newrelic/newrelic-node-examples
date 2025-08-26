/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const jsdoc = require('eslint-plugin-jsdoc')
const sharedConfig = require('@newrelic/eslint-config')

// The new eslint configuration format is a simple array of configuration
// objects. See https://eslint.org/docs/latest/use/configure/configuration-files#configuration-objects.
//
// While working on the config, it can be helpful to run:
//  npx @eslint/config-inspector

// See https://eslint.org/docs/latest/use/configure/ignore#ignoring-files
const globalIgnores = {
  ignores: [
    '**/node_modules/**',
    'out/', // Compiled jsdocs directory.
  ]
}

const newrelicConfigOverrides = {
  files: ['**/newrelic.js', '**/newrelic.mjs'],
  rules: {
    'header/header': 'off'
  }
}

const jsdocConfig = {
  plugins: { jsdoc },
  rules: {
    'jsdoc/require-jsdoc': 'off',
    'jsdoc/tag-lines': 'off',
    'jsdoc/check-types': 'off'
  }
}

// Configuration objects are merged in order. That is, the last object in the
// list will merge with objects earlier in the list. This allows for overriding
// any settings by adding objects to the end of the list.
// See:
// + https://eslint.org/docs/latest/use/configure/configuration-files#cascading-configuration-objectsar
// + https://eslint.org/blog/2022/08/new-config-system-part-2/#goodbye-extends%2C-hello-flat-cascade
module.exports = [
  ...sharedConfig.configs.neostandard,

  sharedConfig.plugins.sonarjs.configs.recommended,
  {
    ...sharedConfig.configs.sonarjsTestsOverrides,
  },
  sharedConfig.configs.sonarjsBaselineOverrides,

  jsdoc.configs['flat/recommended'],
  jsdocConfig,

  {
    ...sharedConfig.configs.nodeRecommended
  },
  {
    files: ['bin/*.js'],
    rules: { 'n/hashbang': 'off' }
  },

  sharedConfig.configs.baselineNewRelicConfig,
  newrelicConfigOverrides,
  globalIgnores
]
