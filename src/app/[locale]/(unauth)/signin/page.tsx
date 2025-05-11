'use client';

import { useEffect } from 'react';

import userManager from '@/libs/oidc';

export default function Signin() {
  useEffect(() => {
    async function handleLogin() {
      await userManager.signinRedirect();
      // const user = await userManager.getUser();
      // const currentTime = Math.floor(Date.now() / 1000);

      // if (user) {
      //   console.log('setting user:', user);
      //   Cookies.set('user', JSON.stringify(user));
      //   if (user.expires_at! < currentTime) {
      //     console.log('renewing');
      //     await userManager.signinRedirect();
      //   }
      //   router.push('/dashboard'); // Redirect to dashboard
      // } else {
      //   console.log('redirect on signin');
      //   router.push('/dashboard'); // Redirect to dashboard
      // }
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
