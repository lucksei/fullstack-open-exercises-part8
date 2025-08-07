import { gql } from '@apollo/client'

const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`;

const EDIT_AUTHOR = gql`
  mutation EditAuthor(
    $name: String!, 
    $setBornTo: Int!
    $token: String!
    ) {
      editAuthor(
        name: $name, 
        setBornTo: $setBornTo
        token: $token
        ) {
          name
          born
    }
  }`

const ADD_BOOK = gql`
  mutation AddBook(
    $title: String!
    $author: String!
    $published: Int!
    $genres: [String!]!
    $token: String!
  ) {
    addBook(
      title: $title
      author: $author
      published: $published
      genres: $genres
      token: $token
    ) {
      title
      author {
        name,
        born,
      }
      published
      genres
    }
  }
`;

const ALL_BOOKS = gql`
  query AllBooks ($author: String, $genre: String) {
    allBooks (author: $author, genre: $genre) {
      title
      author { name }
      published
    }
  }
`;

const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`

const BOOK_GENRES = gql`
  query {
    allBooks {
      genres
    }
  }
`;

const ME = gql`
  query Me {
    me {
      username,
      favoriteGenre
    }
  }`

export { ALL_AUTHORS, EDIT_AUTHOR, ALL_BOOKS, ADD_BOOK, LOGIN, BOOK_GENRES, ME };