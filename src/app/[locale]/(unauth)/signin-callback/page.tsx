'use client';

import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import userManager from '@/libs/oidc';

export default function SigninCallback() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      await userManager.signinRedirectCallback();
      const user = await userManager.getUser();
      console.log('user:', user);
      Cookies.set('user', JSON.stringify(user));
      router.push('/dashboard');
    }

    handleCallback();
  }, [router]);

  return <p>Redirecting...</p>;
}
