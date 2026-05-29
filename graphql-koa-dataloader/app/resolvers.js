/*
 * Copyright 2023 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { getUserById } from './datastore.js'

function userQueryResolver(_, args) {
  return args.id
}

function allUsersQueryResolver() {
  return new Array(10).fill(0).map((_, index) => index + 1)
}

async function getUser(ctx, id) {
  if (process.env.NEW_RELIC_USE_DATALOADER) {
    return await ctx.loaders.getUserById.load(id)
  }
  return await getUserById(Number(id))
}

const UserTypeResolver = {
  age: async (id, _, ctx) => {
    const user = await getUser(ctx, id)
    return user.age
  },
  email: async (id, _, ctx) => {
    const user = await getUser(ctx, id)
    return user.email
  },
  hobbies: async (id, _, ctx) => {
    const user = await getUser(ctx, id)
    return user.hobbies
  },
  id: async (id, _, ctx) => {
    const user = await getUser(ctx, id)
    return user._id
  },
  name: async (id, _, ctx) => {
    const user = await getUser(ctx, id)
    return user.name
  },
  friends: async (id, _, ctx) => {
    const user = await getUser(ctx, id)
    return user.friends
  }
}

export default {
  Query: { user: userQueryResolver, allUsers: allUsersQueryResolver },
  User: UserTypeResolver
}
