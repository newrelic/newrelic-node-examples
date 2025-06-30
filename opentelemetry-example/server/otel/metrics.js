'use strict'

const otel = require('@opentelemetry/api')
const metrics = otel.metrics
const meter = metrics.getMeter('otel-example')

module.exports = {
  authPostLoginCounter: meter.createCounter('auth-post-login'),
  authPostRegisterCounter: meter.createCounter('auth-post-register'),
  fetchAllCounter: meter.createCounter('fetch-all'),
  fetchCrossCounter: meter.createCounter('fetch-cross'),
  httpAllCounter: meter.createCounter('http-all'),
  httpCrossCounter: meter.createCounter('http-cross'),
  deleteProjectCounter: meter.createCounter('delete-project'),
  getProjectCounter: meter.createCounter('get-project'),
  getProjectsCounter: meter.createCounter('get-projects'),
  postProjectsCounter: meter.createCounter('post-projects'),
  putProjectCounter: meter.createCounter('put-project'),
  deleteUserCounter: meter.createCounter('delete-user'),
  getUserCounter: meter.createCounter('get-user'),
  getUsersCounter: meter.createCounter('get-users'),
  postUsersCounter: meter.createCounter('post-users'),
  putUserCounter: meter.createCounter('put-user')
}
