import fs from 'node:fs/promises'
import url from 'node:url'
import path from 'node:path'

let instance

class Database {
  #users = []

  constructor(users) {
    this.#users = users
  }

  allUsers() {
    return this.#users
  }

  userById(id) {
    return this.#users.find(user => user.id == id)
  }

  updateUserById(id, data) {
    for (let i = 0; i < this.#users.length; i += 1) {
      if (this.#users[i].id != id) {
        continue
      }
      this.#users[i] = data
      break
    }
  }
}

export default async function getDatabase() {
  if (instance !== undefined) {
    return instance
  }

  let dataFilePath
  if (import.meta.dirname) {
    dataFilePath = path.join(import.meta.dirname, 'original_data.jsonc')
  } else {
    const dirname = url.fileURLToPath(import.meta.url)
    dataFilePath = path.join(path.dirname(dirname), 'original_data.jsonc')
  }
  const jsonBytes = await fs.readFile(dataFilePath)
  const data = JSON.parse(
    jsonBytes.subarray(jsonBytes.indexOf('\n') + 1).toString('utf8')
  )

  instance = new Database(data.users)

  return instance
}
