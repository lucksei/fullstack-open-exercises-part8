import { useState } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client';
import { ALL_BOOKS, BOOK_GENRES } from '../utils/gqlQueries';
import CustomSelect from './CustomSelect';

const Books = (props) => {
  const [genre, setGenre] = useState(null);
  const booksQuery = useQuery(ALL_BOOKS, { variables: { genre } });
  const allBooksGenre = useQuery(BOOK_GENRES);

  const handleGenreChange = (e) => {
    const genreValue = e.target.value;
    setGenre(genreValue === 'all' ? null : genreValue);
  };

  if (!props.show) {
    return null;
  }

  if (booksQuery.loading || allBooksGenre.loading) {
    return <div>loading...</div>;
  }

  const books = booksQuery.data.allBooks;
  const genres = _.uniq(allBooksGenre.data.allBooks.flatMap((b) => b.genres));

  return (
    <div>
      <h2>books</h2>

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
      <div>
        <CustomSelect
          options={genres.concat('all').map((g) => ({ value: g, label: g }))}
          value={genre ? genre : 'all'}
          onChange={handleGenreChange}
        />
        {/* <button onClick={() => setGenre(null)}>all</button>
        {genres.map((g) => (
          <button key={g} name={g} onClick={handleGenreChange}>
            {g}
          </button>
        ))} */}
      </div>
    </div>
  );
};

Books.propTypes = {
  show: PropTypes.bool.isRequired,
};

export default Books;
