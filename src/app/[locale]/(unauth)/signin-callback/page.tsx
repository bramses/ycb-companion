'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import userManager from '@/libs/oidc';

export default function SigninCallback() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      console.log('handle callbackUrl');
      await userManager.signinRedirectCallback();

      router.push('/dashboard');
    }

    handleCallback();
  }, [router]);

  return <p>Redirecting...</p>;
}
