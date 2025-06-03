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
        console.log('previous window.location.href:', Cookies.get('routeTo'));
        await userManager.signinSilentCallback(
          Cookies.get('routeTo') || '/dashboard',
        );
        const user = await userManager.getUser();
        const redirectTo = Cookies.get('routeTo') || '/dashboard';
        console.log('redirectTo:', redirectTo);
        Cookies.set('user', JSON.stringify(user));
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
