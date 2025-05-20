import Cookies from 'js-cookie';

import userManager from '@/libs/oidc';

export async function authedFetch(input: any, init: any) {
  let user = await userManager.getUser();
  const now = Math.floor(Date.now() / 1000);
  if (!user || (user.expires_at || 0) < now) {
    user = await userManager.signinSilent();
    Cookies.set('user', JSON.stringify(user));
  }

  const headers = {
    ...init.headers,
    Authorization: `${user!.token_type} ${user!.access_token}`,
  };

  let res = await fetch(input, { ...init, headers });
  if (res.status === 401) {
    user = await userManager.signinSilent();
    Cookies.set('user', JSON.stringify(user));
    headers.Authorization = `${user!.token_type} ${user!.access_token}`;
    res = await fetch(input, { ...init, headers });
  }
  return res;
}
