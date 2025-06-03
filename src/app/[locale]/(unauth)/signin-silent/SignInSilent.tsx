'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import userManager from '@/libs/oidc';

export default function SignInSilent() {
  const searchParams = useSearchParams();
  useEffect(() => {
    async function handleLogin() {
      try {
        const original = searchParams.get('callbackUrl') || '/dashboard';
        console.log('original:', original);
        await userManager.signinSilent({ state: original });
      } catch (error) {
        console.warn('Silent signin failed, redirecting to signin', error);
        // If silent signin fails, redirect to regular signin
        window.location.href = '/signin';
      }
    }

    handleLogin();

    // Redirect to /signin after 5 seconds as fallback
    const timeout = setTimeout(() => {
      window.location.href = '/signin';
    }, 5000);

    // Cleanup timeout if component unmounts
    return () => clearTimeout(timeout);
  }, [searchParams]);

  return <div>silent renew…</div>;
}
