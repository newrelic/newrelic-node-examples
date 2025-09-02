/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

function applyExtraSetup(sequelize) {
  const { instrument, orchestra } = sequelize.models

  orchestra.hasMany(instrument)
  instrument.belongsTo(orchestra)
}

module.exports = { applyExtraSetup }
