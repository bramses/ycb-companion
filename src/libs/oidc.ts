import { UserManager } from 'oidc-client-ts';

const oidcConfig = {
  authority: process.env.OIDC_AUTHORITY || 'http://localhost:8080/realms/ycb',
  client_id: process.env.OIDC_CLIENT_ID || 'ycb',
  redirect_uri:
    process.env.OIDC_REDIRECT_URI || 'http://localhost:3000/signin-callback',
  post_logout_redirect_uri:
    process.env.OIDC_LOGOUT_REDIRECT_URI || `http://localhost:3000/`,
  scope: 'openid profile email',
  automaticSilentRenew: true,
  // userStore: new WebStorageStateStore({ store }),
};

const userManager = new UserManager(oidcConfig);

export default userManager;
