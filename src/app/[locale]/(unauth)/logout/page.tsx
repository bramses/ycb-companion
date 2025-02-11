// pages/logout.js

'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import userManager from '@/libs/oidc';

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    async function handleLogout() {
      await userManager.signoutRedirect();
      router.push('/');
    }

    handleLogout();
  }, [router]);

  return <p>Logging out...</p>;
}
