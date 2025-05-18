'use client';

import { useEffect } from 'react';

import userManager from '@/libs/oidc';

export default function Signin() {
  useEffect(() => {
    async function handleLogin() {
      await userManager.signinRedirect();
    }

    handleLogin();
  }, []);

  return (
    <div>
      You are signed in!{' '}
      <a href="/dashboard">Click here to go to the dashboard.</a>
    </div>
  );
}
