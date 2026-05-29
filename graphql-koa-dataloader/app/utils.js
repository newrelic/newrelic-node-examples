/*
 * Copyright 2023 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { faker } from '@faker-js/faker'

const hobbies = [
  'soccer',
  'travelling',
  'dancing',
  'painting',
  'sailing',
  'fishing',
  'movies',
  'coding'
]

function generateUsers(count) {
  let id = 1
  const countToN = Array.from({ length: count }, (_, i) => i + 1)
  return new Array(count).fill(0).map(() => {
    return {
      age: faker.number.int({ min: 20, max: 40 }),
      email: faker.internet.email(),
      hobbies: faker.helpers.arrayElements(hobbies, faker.number.int({ min: 1, max: 4 })),
      _id: id++,
      name: faker.person.fullName(),
      friends: faker.helpers.arrayElements(countToN, faker.number.int({ min: 1, max: 7 }))
    }
  })
}

export { generateUsers }
