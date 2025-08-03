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

const hardcodedPassword = "verysafepassword"

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
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
    allAuthors: () => authors.map((author) => appendBookCount(author, books)),
    me: async () => {
      if (!currentToken.value) {
        return null
      }
      const decodedToken = jwt.verify(currentToken.value, process.env.SECRET, { complete: true })
      const { username, id, _ } = decodedToken.payload
      const user = await User.findById(id)
      return user
    },
  },
  Mutation: {
    addBook: async (root, args) => {
      const { title, published, author, genres } = args
      let bookAuthor = await Author.findOne({ name: args.author })
      if (!bookAuthor) {
        bookAuthor = new Author({
          name: args.author,
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
    editAuthor: (root, args) => {
      const author = authors.find((author) => author.name === args.name)
      if (!author) {
        return null
      }
      const editedAuthor = { ...author, born: args.setBornTo }
      authors = authors.map((author) => author.name === editedAuthor.name ? editedAuthor : author)
      return appendBookCount(editedAuthor, books)
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