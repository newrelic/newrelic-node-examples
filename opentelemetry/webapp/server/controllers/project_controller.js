/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { Project } = require('../models')
const {
  deleteProjectCounter,
  getProjectCounter,
  getProjectsCounter,
  postProjectsCounter,
  putProjectCounter
} = require('../otel/metrics')

const postProjects = (req, res, next) => {
  postProjectsCounter.add(1)

  const userId = req.params.id
  const props = req.body.project

  Project.create({ ...props, user_id: userId })
    .then((project) => res.json({
      ok: true,
      message: 'Project created',
      project,
      userId
    }))
    .catch(next)
}

const getProjects = (req, res, next) => {
  getProjectsCounter.add(1)

  const userId = req.params.id

  Project.findAll()
    .then((projects) => res.json({
      ok: true,
      message: 'Projects found',
      projects,
      userId
    }))
    .catch(next)
}

const getProject = (req, res, next) => {
  getProjectCounter.add(1)

  const projectId = req.params.id

  Project.findById(projectId)
    .then((project) => res.json({
      ok: true,
      message: 'Project found',
      project
    }))
    .catch(next)
}

const putProject = (req, res, next) => {
  putProjectCounter.add(1)

  const projectId = req.params.id
  const props = req.body.project

  Project.update(projectId, props)
    .then((project) => res.json({
      ok: true,
      message: 'Project updated',
      project
    }))
    .catch(next)
}

const deleteProject = (req, res, next) => {
  deleteProjectCounter.add(1)

  const projectId = req.params.id

  Project.destroy(projectId)
    .then((deleteCount) => res.json({
      ok: true,
      message: 'Project deleted',
      deleteCount
    }))
    .catch(next)
}

module.exports = {
  postProjects,
  getProjects,
  getProject,
  putProject,
  deleteProject
}
