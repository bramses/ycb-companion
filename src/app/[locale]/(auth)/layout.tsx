// TODO switch to next-auth provider

'use client';

import { useEffect } from 'react';

import userManager from '@/libs/oidc';

export default function AuthLayout(props: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  useEffect(() => {
    async function handleLogin() {
      const user = await userManager.getUser();

      // save user to local storage
      localStorage.setItem('user', JSON.stringify(user));

      if (!user) {
        await userManager.signinRedirect();
      }
    }

    handleLogin();
  }, []);

  return props.children;
}
