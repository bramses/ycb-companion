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
      console.log('signinRedirectCallback');
      console.log('callbackUrl:', searchParams.get('callbackUrl'));
      await userManager.signinCallback();
      const user = await userManager.getUser();

      Cookies.set('user', JSON.stringify(user));
      if (Cookies.get('routeTo')) {
        router.push(Cookies.get('routeTo')!);
        Cookies.remove('routeTo');
      } else {
        router.push('/dashboard');
      }
    }

    handleCallback();
  }, [router, searchParams]);

  return <p>Redirecting...</p>;
}
