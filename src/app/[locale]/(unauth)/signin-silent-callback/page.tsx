'use client';

import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import userManager from '@/libs/oidc';

export default function SilentCallback() {
  const router = useRouter();
  useEffect(() => {
    const renewUser = async () => {
      // const currentTime = Math.floor(Date.now() / 1000);
      // console.log(!user || (user && user.expires_at! < currentTime));
      // if (!user || (user && user.expires_at! < currentTime)) {
      //   // redirect to signin
      //   console.log('sending to signin');
      //   await userManager.signinRedirect();
      //   return;
      // }

      await userManager.signinSilentCallback();
      const user = await userManager.getUser();
      console.log('[silent callback] user is :', user);
      Cookies.set('user', JSON.stringify(user));
      router.push('/dashboard');
    };

    renewUser();
  }, []);

  return <p>silent renew…</p>;
}
