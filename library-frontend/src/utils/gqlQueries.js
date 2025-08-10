import { gql } from '@apollo/client'

// Queries

const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
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

// Mutations 

const EDIT_AUTHOR = gql`
  mutation EditAuthor(
    $name: String!, 
    $setBornTo: Int!
    ) {
      editAuthor(
        name: $name, 
        setBornTo: $setBornTo
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
  ) {
    addBook(
      title: $title
      author: $author
      published: $published
      genres: $genres
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
const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`

const BOOK_ADDED = gql`
  subscription BookAdded {
    bookAdded {
      title,
      genres,
      author {
        id,
        name,
      },
      published,
    }
  }
`


export { ALL_AUTHORS, ALL_BOOKS, ADD_BOOK, EDIT_AUTHOR, LOGIN, BOOK_GENRES, ME, BOOK_ADDED };