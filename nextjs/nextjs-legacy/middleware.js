/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

// Evidently we can't log every request because Next.js runs this script
// in a worker thread and that prevents `newrelic` from instrumenting
// the logger.

// import logger from './lib/logger.js'
//
// export function middleware(request) {
//   logger.info({method: request.method, url: request.url}, "received request")
// }

export function middleware() {}
