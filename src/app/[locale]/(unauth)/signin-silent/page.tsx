'use client';

import { useEffect } from 'react';

import userManager from '@/libs/oidc';

export default function Home() {
  useEffect(() => {
    async function handleLogin() {
      await userManager.signinSilent();
    }

    handleLogin();
  }, []);

  return <div>silent renew…</div>;
}
