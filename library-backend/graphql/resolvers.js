const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const Author = require('../schemas/author')
const Book = require('../schemas/book')
const User = require('../schemas/user')

const { appendBookCount } = require('../utils/helpers')

// Global token, not the best approach for user logging though
// but 'me' query had no variables so i supposed that it wanted
// me to "remember" that info somewhere in the backend.
let currentToken = {
  value: null
}

const validateToken = async (token) => {
  if (!token) {
    return null
  }
  try {
    const decodedTokenPayload = jwt.verify(token, process.env.SECRET)
    const { username, id } = decodedTokenPayload
    const user = await User.findById(id)
    if (!user) {
      return null
    }
    return user
  } catch (e) {
    return null
  }
}

const hardcodedPassword = "admin"

const resolvers = {
  Query: {
    bookCount: async () => (await Book.find({})).length,
    authorCount: async () => (await Author.find({})).length,
    allBooks: async (root, args) => {
      // NOTE: The allBooks is not returning authors's bookCount field yet... TODO: fix
      let booksQuery = Book.find({}).populate('author')
      if (args.author) {
        booksQuery = booksQuery.where('author').equals(args.author)
      }
      if (args.genre) {
        booksQuery = booksQuery.where('genres').equals(args.genre)
      }
      let books = await booksQuery

      return books
    },
    allAuthors: async () => {
      const authors = await Author.find({})
      const books = await Book.find({})

      return authors.map(author => ({
        name: author.name,
        born: author.born,
        id: author.id,
        bookCount: books.filter(book => book.author.toString() === author._id.toString()).length,
      }))
    },
    me: async () => {
      return validateToken(currentToken.value)
    },
  },
  Mutation: {
    addBook: async (root, args) => {
      const { title, published, author, genres, token } = args
      if (! await validateToken(token)) {
        throw new GraphQLError("User token is null or invalid", { extensions: { code: "INVALID_TOKEN", } })
      }

      let bookAuthor = await Author.findOne({ name: author })
      if (!bookAuthor) {
        bookAuthor = new Author({ name: author, born: null })
        try {
          await bookAuthor.save()
        } catch (error) {
          throw new GraphQLError("Error saving author", { extensions: { code: "BAD_USER_INPUT", invalidArgs: args, error } })
        }
      }
      try {
        const newBook = new Book({ title, published, author: bookAuthor._id, genres, })
        const savedBook = await newBook.save()
        return await savedBook.populate('author')
      } catch (error) {
        throw new GraphQLError("Error saving book", { extensions: { code: "BAD_USER_INPUT", invalidArgs: args, error } })
      }
    },
    editAuthor: async (root, args) => {
      const { name, setBornTo, token } = args
      if (! await validateToken(token)) {
        throw new GraphQLError("User token is null or invalid", {
          extensions: {
            code: "INVALID_TOKEN",
          }
        })
      }
      const editedAuthor = await Author.findOneAndUpdate({ name }, {
        born: setBornTo,
      }, { new: true })
      return editedAuthor
    },
    createUser: async (root, args) => {
      const { username, favoriteGenre } = args
      try {
        const newUser = await User.create({ username, favoriteGenre })
        return newUser
      } catch (error) {
        throw new GraphQLError("Error saving user", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args,
            error,
          }
        })
      }
    },
    login: async (root, args) => {
      const { username, password } = args
      const user = await User.findOne({ username })
      if (!user || password !== hardcodedPassword) {
        throw new GraphQLError("User or password is incorrect", { extensions: { code: "BAD_USER_INPUT" } })
        // return null
      }
      const userForToken = {
        username: user.username,
        id: user._id,
      }
      currentToken.value = jwt.sign(userForToken, process.env.SECRET)
      return currentToken
    },
  }
}

module.exports = resolvers