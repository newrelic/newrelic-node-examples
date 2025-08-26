/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

function pickRandom(args) {
  return args[Math.floor(Math.random() * args.length)]
}

function randomDate() {
  return new Date(new Date() - 200000000000 * Math.random())
}

module.exports = { pickRandom, randomDate }
