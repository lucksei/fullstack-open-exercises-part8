import PropTypes from 'prop-types';
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { EDIT_AUTHOR, ALL_AUTHORS } from '../utils/gqlQueries';

import CustomSelect from './CustomSelect';

const EditAuthorBirth = (props) => {
  const [error, setError] = useState(null);
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    onError: (error) => {
      setError(error.graphQLErrors.message);
    },
  });

  const query = useQuery(ALL_AUTHORS);

  const [name, setName] = useState('');
  const [born, setBorn] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    editAuthor({
      variables: {
        name,
        setBornTo: parseInt(born),
        token: props.token,
      },
    });

    setName('');
    setBorn('');
  };

  if (!props.show) {
    return null;
  }

  if (query.loading) {
    return <div>loading...</div>;
  }

  const authors = query.data.allAuthors;

  return (
    <div>
      <h2>Set Birthyear</h2>
      <form>
        <CustomSelect
          options={authors.map((a) => ({ value: a.name, label: a.name }))}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div>
          born
          <input value={born} onChange={(e) => setBorn(e.target.value)} />
        </div>
        <button type="submit" onClick={handleSubmit}>
          update author
        </button>
      </form>
    </div>
  );
};

EditAuthorBirth.propTypes = {
  show: PropTypes.bool.isRequired,
  token: PropTypes.string,
};

export default EditAuthorBirth;
