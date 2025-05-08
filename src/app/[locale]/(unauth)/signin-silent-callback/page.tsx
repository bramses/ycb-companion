'use client';

import Cookies from 'js-cookie';
import { useEffect } from 'react';

import userManager from '@/libs/oidc';

export default function SilentCallback() {
  useEffect(() => {
    const renewUser = async () => {
      console.log('silent renewing');
      const user = await userManager.getUser();
      Cookies.set('user', JSON.stringify(user));
      userManager.signinSilentCallback().catch(console.error);
    };

    renewUser();
  }, []);

  return <p>silent renew…</p>;
}
