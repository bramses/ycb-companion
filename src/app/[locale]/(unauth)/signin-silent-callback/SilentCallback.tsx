'use client';

import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import userManager from '@/libs/oidc';

export default function SilentCallback() {
  const router = useRouter();
  useEffect(() => {
    const renewUser = async () => {
      try {
        await userManager.signinSilentCallback();
      } catch (err) {
        console.warn(
          'silent renew callback error, redirecting to sign in',
          err,
        );
        router.push('/signin');
      }
      const user = await userManager.getUser();

      Cookies.set('user', JSON.stringify(user));
      if (Cookies.get('routeTo')) {
        router.push(Cookies.get('routeTo')!);
        Cookies.remove('routeTo');
      } else {
        router.push('/dashboard');
      }
    };

    renewUser();
  }, [router]);

  return <p>silent renew…</p>;
}
