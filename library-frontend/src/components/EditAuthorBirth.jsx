import PropTypes from 'prop-types';
import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { EDIT_AUTHOR, ALL_AUTHORS } from '../utils/gqlQueries';

const EditAuthorBirth = (props) => {
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });
  const [name, setName] = useState('');
  const [born, setBorn] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    editAuthor({
      variables: {
        name,
        setBornTo: parseInt(born),
      },
    });

    setName('');
    setBorn('');
  };

  if (!props.show) {
    return null;
  }

  return (
    <div>
      <h2>Set Birthyear</h2>
      <form>
        <div>
          name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
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
};

export default EditAuthorBirth;
