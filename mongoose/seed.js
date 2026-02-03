const model = require('./model')
const mongoose = require('mongoose')
const { CONN_STRING } = require('./constants')
const { faker } = require('@faker-js/faker')


async function main() {
  const promises = []
  await mongoose.connect(CONN_STRING)
  for (let i = 0; i < 100; i++) {
    const prom = model.create({
      title: faker.book.title(), 
      author: faker.person.firstName() + ' ' + faker.person.lastName(), 
      body: faker.lorem.paragraphs(5), 
      comments: [{ body: faker.lorem.sentence(), date: Date.now() }],
      hidden: false,
      meta: {
        votes: 1,
        favs: 1
      }
    })
    promises.push(prom)
  }
  await Promise.all(promises)
  console.log('done seeding db')
  process.exit(0)
}

main()
