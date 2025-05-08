'use client';

import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import userManager from '@/libs/oidc';

export default function SigninCallback() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      console.log('handle callbackUrl');
      console.log('userManager:', userManager);
      const user = await userManager.getUser();
      Cookies.set('user', JSON.stringify(user));
      await userManager.signinRedirectCallback();
      router.push('/dashboard');
    }

    handleCallback();
  }, [router]);

  return <p>Redirecting...</p>;
}
