const { randomUUID } = require('crypto')
const Author = require('../schemas/author')
const Book = require('../schemas/book')
const { authors, books } = require('../utils/mockData')



const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => {
      let _books = books
      if (args.author) {
        _books = _books.filter((book) => book.author === args.author)
      }
      if (args.genre) {
        _books = _books.filter((book) => book.genres.includes(args.genre))
      }
      return _books
    },
    allAuthors: () => authors.map((author) => appendBookCount(author, books)),
  },
  Mutation: {
    addBook: async (root, args) => {
      console.log("executing")
      let bookAuthor = await Author.findOne({ name: args.author })
      console.log(bookAuthor)
      if (!bookAuthor) {
        bookAuthor = new Author({
          name: args.author,
          born: null
        })
        bookAuthor = await bookAuthor.save()
      }
      console.log(bookAuthor)
      const newBook = new Book({
        title: args.title,
        published: args.published,
        author: bookAuthor._id,
        genres: args.genres
      })
      const savedBook = await newBook.save()
      return savedBook.populate('author')
      // const author = authors.find((author) => author.name === args.author)
      // if (!author) {
      //   const newAuthor = {
      //     name: args.author,
      //     born: null
      //   }
      //   authors = authors.concat(newAuthor)
      // }
      // const book = { ...args, id: randomUUID() }
      // books = books.concat(book)
      // return book
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