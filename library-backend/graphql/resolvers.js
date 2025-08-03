const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const Author = require('../schemas/author')
const Book = require('../schemas/book')
const User = require('../schemas/user')

const { authors, books } = require('../utils/mockData')

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

const hardcodedPassword = "verysafepassword"

const resolvers = {
  Query: {
    bookCount: async () => (await Book.find({})).length,
    authorCount: async () => (await Author.find({})).length,
    allBooks: async (root, args) => {
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
    // allAuthors: () => authors.map((author) => appendBookCount(author, books)),
    allAuthors: async () => await Author.find({}),
    me: async () => {
      return validateToken(currentToken.value)
    },
  },
  Mutation: {
    addBook: async (root, args) => {
      const { title, published, author, genres, token } = args
      if (! await validateToken(token)) {
        throw new GraphQLError("User token is null or invalid", {
          extensions: {
            code: "INVALID_TOKEN",
          }
        })
      }
      let bookAuthor = await Author.findOne({ name: author })
      if (!bookAuthor) {
        bookAuthor = new Author({
          name: author,
          born: null
        })
        try {
          await bookAuthor.save()
        } catch (error) {
          throw new GraphQLError("Error saving author", {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: args,
              error,
            }
          })
        }
      }
      const newBook = new Book({
        title,
        published,
        author: bookAuthor._id,
        genres,
      })
      try {
        await newBook.save()
        return newBook.populate('author')
      } catch (error) {
        throw new GraphQLError("Error saving book", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args,
            error,
          }
        })
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
      if (!user) {
        return null
      }
      if (password !== hardcodedPassword) {
        return null
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