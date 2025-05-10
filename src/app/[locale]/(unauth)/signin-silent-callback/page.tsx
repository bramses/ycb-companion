'use client';

import Cookies from 'js-cookie';
import { useEffect } from 'react';

import userManager from '@/libs/oidc';

export default function SilentCallback() {
  useEffect(() => {
    const renewUser = async () => {
      console.log('silent renewing!!');
      const user = await userManager.getUser();
      console.log('user is :', user);
      const currentTime = Math.floor(Date.now() / 1000);
      console.log(!user || (user && user.expires_at! < currentTime));
      if (!user || (user && user.expires_at! < currentTime)) {
        // redirect to signin
        console.log('sending to signin');
        window.location.href =
          'https://development.yourcommonbase.com/keycloak/';
        return;
      }
      Cookies.set('user', JSON.stringify(user));
      userManager.signinSilentCallback().catch(console.error);
    };

    renewUser();
  }, []);

  return <p>silent renew…</p>;
}
