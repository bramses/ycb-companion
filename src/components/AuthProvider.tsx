'use client';

import Cookies from 'js-cookie';
import { useEffect } from 'react';

import userManager from '@/libs/oidc';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const renew = async () => {
      try {
        await userManager.signinSilent();
      } catch (error) {
        console.warn(error);
      }
    };

    console.log('[authprovider] userManager:', userManager);

    userManager.events.addAccessTokenExpiring(renew);
    userManager.events.addAccessTokenExpired(renew);
    userManager.events.addUserLoaded((user) => {
      Cookies.set('user', JSON.stringify(user));
    });

    return () => {
      userManager.events.removeAccessTokenExpiring(renew);
      userManager.events.removeAccessTokenExpired(renew);
    };
  }, []);

  return children;
}
