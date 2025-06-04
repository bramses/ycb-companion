'use client';

import Cookies from 'js-cookie';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import userManager from '@/libs/oidc';

export default function SigninCallback() {
  const searchParams = useSearchParams();
  // const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      console.log(window.location.href);
      // get last router
      console.log('signinRedirectCallback');
      console.log('signin window.location.href:', Cookies.get('routeTo'));
      const callbackUrl = searchParams.get('callbackUrl');
      console.log('callbackUrl:', callbackUrl);
      const user = await userManager.signinRedirectCallback();
      console.log('user si:', user);

      if (!user || !user.access_token) {
        console.error('Authentication failed - no user or access token');
        // Don't redirect to avoid infinite loops, just show error
        return;
      }

      const redirectTo =
        (user?.state as string) || Cookies.get('routeTo') || '/dashboard';

      // Set cookie with validated user object
      Cookies.set('user', JSON.stringify(user), {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        domain:
          window.location.hostname === 'localhost'
            ? undefined
            : window.location.hostname,
      });

      // Force page reload to ensure server-side sees the cookie
      console.log('Authentication complete, reloading to sync cookies');

      Cookies.remove('routeTo');
      window.location.href = redirectTo;

      // Cookies.set('user', JSON.stringify(user));
      // if (Cookies.get('routeTo')) {
      //   router.push(Cookies.get('routeTo')!);
      //   Cookies.remove('routeTo');
      // } else {
      //   router.push('/dashboard');
      // }
    }

    handleCallback();
  }, []);

  return <p>Redirecting...</p>;
}
