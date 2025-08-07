const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const { JsonWebTokenError } = require('jsonwebtoken')
const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')

const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers')
const User = require('./schemas/user')

require('dotenv').config()
const MONGODB_URI = process.env.MONGODB_URI
const connect = async () => {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB")
  } catch (error) {
    console.log("Error connecting to MongoDB:", error.message)
  }
}

connect()

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => {
    const auth = req.headers.authorization
    if (auth?.toLowerCase().startsWith('bearer ')) {
      const token = auth.substring(7)
      try {
        const decodedToken = jwt.verify(token, process.env.SECRET)
        const user = await User.findById(decodedToken.id)
        return { currentUser: user }
      } catch (error) {
        console.error('Error decoding token:', error)
      }
    }
    return {}
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
