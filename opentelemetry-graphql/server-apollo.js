'use strict'

const { ApolloServer } = require('apollo-server')
const buildSchema = require('./schema')

// Construct a schema, using GraphQL schema language
const schema = buildSchema()

const server = new ApolloServer({ schema })
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})

console.log('Running a GraphQL API server at http://localhost:4000/graphql')
