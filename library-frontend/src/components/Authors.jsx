import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client';
import { ALL_AUTHORS } from '../utils/gqlQueries';

import EditAuthorBirth from './EditAuthorBirth';

const Authors = (props) => {
  const query = useQuery(ALL_AUTHORS);

  if (!props.show) {
    return null;
  }

  if (query.loading) {
    return <div>loading...</div>;
  }

  const authors = query.data.allAuthors;

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <EditAuthorBirth show={props.token !== null} />
    </div>
  );
};

Authors.propTypes = {
  show: PropTypes.bool.isRequired,
  token: PropTypes.string,
};

export default Authors;
