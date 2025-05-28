'use client';

import { useEffect } from 'react';

import userManager from '@/libs/oidc';

export default function Home() {
  useEffect(() => {
    async function handleLogin() {
      await userManager.signinSilent();
    }

    handleLogin();

    // Redirect to /signin after 5 seconds
    const timeout = setTimeout(() => {
      window.location.href = '/signin';
    }, 5000);

    // Cleanup timeout if component unmounts
    return () => clearTimeout(timeout);
  }, []);

  return <div>silent renew…</div>;
}
