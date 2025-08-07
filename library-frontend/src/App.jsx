import { useEffect, useState } from 'react';
import { useApolloClient, useQuery } from '@apollo/client';
import { ME } from './utils/gqlQueries';

import Authors from './components/Authors';
import Books from './components/Books';
import NewBook from './components/NewBook';
import Login from './components/Login';
import Recommend from './components/Recommend';

const App = () => {
  const client = useApolloClient();
  const [token, setToken] = useState(null);
  const [page, setPage] = useState('authors');
  const meQuery = useQuery(ME);

  useEffect(() => {
    const userToken = localStorage.getItem('library-user-token');
    if (userToken) {
      setToken(userToken);
    }
  }, []);

  const handleLogout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
  };

  const handleToken = (token) => {
    setToken(token);
    localStorage.setItem('library-user-token', token);
    // NOTE: resetting the cache too quickly causes the token to not be set, this is an, albiet ugly, workaround to this issue
    setTimeout(() => {
      client.resetStore();
      setPage('authors');
    }, 500);
  };

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token ? (
          <button onClick={() => setPage('add')}>add book</button>
        ) : null}
        {token ? (
          <button onClick={() => setPage('recommend')}>recommend</button>
        ) : null}
        {token === null ? (
          <button onClick={() => setPage('login')}>login</button>
        ) : (
          <button onClick={handleLogout}>logout</button>
        )}
      </div>

      <Authors show={page === 'authors'} token={token} />

      <Books show={page === 'books'} />

      <NewBook show={page === 'add'} token={token} />

      <Recommend
        show={page === 'recommend' && token !== null}
        favoriteGenre={meQuery.data?.me?.favoriteGenre}
      />

      <Login show={page === 'login' && token === null} setToken={handleToken} />
    </div>
  );
};

export default App;
