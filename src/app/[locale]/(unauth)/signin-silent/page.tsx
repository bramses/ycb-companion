'use client';

import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import userManager from '@/libs/oidc';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    async function handleLogin() {
      const user = await userManager.getUser();
      const currentTime = Math.floor(Date.now() / 1000);

      if (user) {
        console.log('setting user silent:', user);
        Cookies.set('user', JSON.stringify(user));
        if (user.expires_at! < currentTime) {
          console.log('[silent]renewing');
          await userManager.signinSilent();
        }
        router.push('/dashboard'); // Redirect to dashboard
      } else {
        console.log('[silent] redirect');

        await userManager.signinRedirect();
        router.push('/dashboard'); // Redirect to dashboard
      }
    }

    handleLogin();
  }, []);

  // after 500 ms redirect to dashboard
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('[silent] redirecting to dashboard');
      router.push('/dashboard');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      You are signed in!{' '}
      <a href="/dashboard">Click here to go to the dashboard.</a>
    </div>
  );
}
