'use client';

import Cookies from 'js-cookie';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import userManager from '@/libs/oidc';

export default function Signin() {
  const searchParams = useSearchParams();
  console.log('signin searchParams:', searchParams);
  useEffect(() => {
    console.log('signin');
    // get routeTo from cookie
    const routeTo = Cookies.get('routeTo');
    if (routeTo) {
      console.log('routeTo:', routeTo);
      const callbackUrl = routeTo;
      userManager.signinRedirect({ state: callbackUrl });
      return;
    }

    const original = searchParams.get('callbackUrl') || '/dashboard';
    console.log('original:', original);
    userManager.signinRedirect({ state: original });
  }, [searchParams]);
  return <div>redirecting to login…</div>;
}
