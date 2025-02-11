'use client';

import { useAuth } from 'react-oidc-context';

function App() {
  const auth = useAuth();
  console.log('auth:', auth);

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Oops... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <div>
        Hello {auth.user?.profile.sub}{' '}
        <button type="button" onClick={() => auth.removeUser()}>
          Log out
        </button>
      </div>
    );
  }

  return (
    <button type="button" onClick={() => auth.signinRedirect()}>
      Log in
    </button>
  );
}

export default App;
