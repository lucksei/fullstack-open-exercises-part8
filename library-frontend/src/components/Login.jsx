import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN } from '../utils/gqlQueries';
const Login = ({ show, setToken }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      setError(error.graphQLErrors[0].message);
    },
  });

  useEffect(() => {
    if (result.data?.login) {
      const token = result.data.login.value;
      setToken(token);
    }
  }, [result.data, setToken]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('submit');

    await login({
      variables: {
        username: name,
        password: password,
      },
    });
    setName('');
    setPassword('');
  };

  if (!show) {
    return null;
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
      <div>{error}</div>
    </div>
  );
};

Login.propTypes = {
  show: PropTypes.bool.isRequired,
  setToken: PropTypes.func.isRequired,
};

export default Login;
