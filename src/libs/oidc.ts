'use client';

import { UserManager } from 'oidc-client-ts';

const oidcConfig = {
  authority: 'http://localhost:8080/realms/ycb',
  client_id: 'ycb-public',
  redirect_uri: `http://localhost:3000/signin-callback`,
  post_logout_redirect_uri: `http://localhost:3000/`,
  scope: 'openid profile email',
  automaticSilentRenew: true,
  // userStore: new WebStorageStateStore({ store: window.localStorage }),
};

const userManager = new UserManager(oidcConfig);

export default userManager;

export const getAccessToken = async () => {
  const session = await userManager.getUser();
  if (session) {
    return session.access_token;
  }
  return null;
};
