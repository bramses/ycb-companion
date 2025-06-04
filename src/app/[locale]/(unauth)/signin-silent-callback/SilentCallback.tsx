'use client';

import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import userManager from '@/libs/oidc';

export default function SilentCallback() {
  const router = useRouter();
  useEffect(() => {
    const renewUser = async () => {
      try {
        const user = (await userManager.signinSilentCallback()) as any;

        if (!user || !user.access_token) {
          console.error(
            'Silent authentication failed - no user or access token',
          );
          // Don't redirect to avoid infinite loops, let the parent handle it
          throw new Error('Silent authentication failed');
        }

        const redirectTo =
          (user?.state as string) || Cookies.get('routeTo') || '/dashboard';
        console.log('Redirecting to:', redirectTo);

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

        console.log('Silent callback: Cookie set successfully');

        Cookies.remove('routeTo');
        router.push(redirectTo);
      } catch (err) {
        console.warn(
          'silent renew callback error, redirecting to sign in',
          err,
        );
        router.push('/signin');
      }
    };

    renewUser();
  }, [router]);

  return <p>silent renew…</p>;
}
