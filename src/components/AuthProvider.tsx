'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import userManager from '@/libs/oidc';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // useEffect(() => {
  //   const renew = async () => {
  //     try {
  //       console.log('authprovider useeffect');
  //       await userManager.signinSilent({
  //         state: window.location.pathname,
  //       });
  //       const user = await userManager.getUser();
  //       const currentTime = Math.floor(Date.now() / 1000);
  //       if (!user || (user && user.expires_at! < currentTime)) {
  //         Cookies.set('user', '');
  //         await userManager.clearStaleState();
  //         await userManager.startSilentRenew();
  //       }
  //     } catch (error) {
  //       console.warn(error);
  //     }
  //   };

  //   console.log('[authprovider] userManager:', userManager);

  //   userManager.events.addAccessTokenExpiring(renew);
  //   userManager.events.addAccessTokenExpired(renew);
  //   userManager.events.addUserLoaded((user) => {
  //     console.log('userManager.events.addUserLoaded:', user);
  //     Cookies.set('user', JSON.stringify(user));
  //   });

  //   return () => {
  //     userManager.events.removeAccessTokenExpiring(renew);
  //     userManager.events.removeAccessTokenExpired(renew);
  //   };
  // }, []);

  const router = useRouter();

  useEffect(() => {
    async function bootstrap() {
      const path = window.location.pathname;

      // if we’re on the callback page, finish signin and redirect
      if (
        path === '/signin-callback' ||
        path === '/signin-silent-callback' ||
        path === '/signin' ||
        path === '/signin-silent'
      ) {
        return;
      }

      // otherwise, normal bootstrap logic
      const user = await userManager.getUser();
      if (!user) {
        console.log('no session, redirect to signin with state', path);
        userManager.signinRedirect({ state: path });
        return;
      }
      if (user.expired) {
        try {
          console.log('token expired, doing silent renew');
          await userManager.signinSilent({ state: path });
        } catch {
          console.log('silent renew failed, interactive login');
          userManager.signinRedirect({ state: path });
        }
      }
      // if we get here, session is valid
    }

    bootstrap();
  }, [router]);

  return children;
}
