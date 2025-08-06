import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client';
import { ALL_BOOKS } from '../utils/gqlQueries';

const Recommend = (props) => {
  const booksQuery = useQuery(ALL_BOOKS, {
    variables: { genre: props.favoriteGenre },
  });

  if (!props.show) {
    return null;
  }

  if (booksQuery.loading) {
    return <div>loading...</div>;
  }

  const books = booksQuery.data.allBooks;
  return (
    <div>
      <h2>recommendations</h2>
      <div>books in your favorite genere: {props.favoriteGenre}</div>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

Recommend.propTypes = {
  show: PropTypes.bool.isRequired,
  favoriteGenre: PropTypes.string,
};

export default Recommend;
