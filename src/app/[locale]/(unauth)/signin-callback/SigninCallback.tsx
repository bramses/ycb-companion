'use client';

import Cookies from 'js-cookie';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import userManager from '@/libs/oidc';

export default function SigninCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();

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
      const redirectTo =
        (user?.state as string) || Cookies.get('routeTo') || '/dashboard';
      Cookies.set('user', JSON.stringify(user));
      Cookies.remove('routeTo');
      router.push(redirectTo);

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
