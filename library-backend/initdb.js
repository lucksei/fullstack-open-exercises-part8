const mongoose = require('mongoose')

const Book = require('./schemas/book')
const Author = require('./schemas/author')
const { authors, books } = require('./utils/mockData')

require('dotenv').config()
const MONGODB_URI = process.env.MONGODB_URI

const initDb = async () => {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB")

    console.log("Resetting the database...")
    await Book.deleteMany({})
    await Author.deleteMany({})

    // console.log("Creating Authors...")
    // for (const author of authors) {
    //   await Author.create(author)
    // }

    // for (const book of books) {
    //   // ...
    // }
  } catch (error) {
    console.log("Error connecting to MongoDB:", error.message)
  } finally {
    console.log("Disconnecting from the database...")
    await mongoose.disconnect()
  }

}

initDb()

