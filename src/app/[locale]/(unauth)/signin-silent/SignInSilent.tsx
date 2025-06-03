'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import userManager from '@/libs/oidc';

export default function SignInSilent() {
  const searchParams = useSearchParams();
  useEffect(() => {
    async function handleLogin() {
      const original = searchParams.get('callbackUrl') || '/dashboard';
      console.log('original:', original);
      await userManager.signinSilent({ state: original });
    }

    handleLogin();

    // Redirect to /signin after 5 seconds
    const timeout = setTimeout(() => {
      window.location.href = '/signin';
    }, 2000);

    // Cleanup timeout if component unmounts
    return () => clearTimeout(timeout);
  }, []);

  return <div>silent renew…</div>;
}
