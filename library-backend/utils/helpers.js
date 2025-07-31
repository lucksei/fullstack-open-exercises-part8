const appendBookCount = (author, books) => {
  return { ...author, bookCount: books.filter((book) => book.author === author.name).length }
}

module.exports = { appendBookCount } 