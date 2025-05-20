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
        console.log('authprovider useeffect');
        await userManager.signinSilent();
        const user = await userManager.getUser();
        const currentTime = Math.floor(Date.now() / 1000);
        if (!user || (user && user.expires_at! < currentTime)) {
          Cookies.set('user', '');
          await userManager.clearStaleState();
          await userManager.startSilentRenew();
        }
      } catch (error) {
        console.warn(error);
      }
    };

    console.log('[authprovider] userManager:', userManager);

    userManager.events.addAccessTokenExpiring(renew);
    userManager.events.addAccessTokenExpired(renew);
    userManager.events.addUserLoaded((user) => {
      console.log('userManager.events.addUserLoaded:', user);
      Cookies.set('user', JSON.stringify(user));
    });

    return () => {
      userManager.events.removeAccessTokenExpiring(renew);
      userManager.events.removeAccessTokenExpired(renew);
    };
  }, []);

  return children;
}
