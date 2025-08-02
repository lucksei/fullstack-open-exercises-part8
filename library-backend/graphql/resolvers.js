const { randomUUID } = require('crypto')
const Author = require('../schemas/author')
const Book = require('../schemas/book')
const { authors, books } = require('../utils/mockData')
const { GraphQLError } = require('graphql')



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
  },
  Mutation: {
    addBook: async (root, args) => {
      let bookAuthor = await Author.findOne({ name: args.author })
      if (!bookAuthor) {
        bookAuthor = new Author({
          name: args.author,
          born: null
        })
        try {
          bookAuthor = await bookAuthor.save()
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
        title: args.title,
        published: args.published,
        author: bookAuthor._id,
        genres: args.genres
      })
      try {
        const savedBook = await newBook.save()
        return savedBook.populate('author')
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
    }
  }
}

module.exports = resolvers