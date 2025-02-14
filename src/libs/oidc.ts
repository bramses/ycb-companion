import { UserManager } from 'oidc-client-ts';

const oidcConfig = {
  authority: process.env.OIDC_AUTHORITY!,
  client_id: process.env.OIDC_CLIENT_ID!,
  redirect_uri: process.env.OIDC_REDIRECT_URI!,
  post_logout_redirect_uri: process.env.OIDC_LOGOUT_REDIRECT_URI!,
  scope: 'openid profile email',
  automaticSilentRenew: true,
  // userStore: new WebStorageStateStore({ store }),
};

const userManager = new UserManager(oidcConfig);

export default userManager;
