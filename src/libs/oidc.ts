import { UserManager } from 'oidc-client-ts';

const oidcConfig = {
  authority: 'http://localhost:8080/realms/ycb',
  client_id: 'ycb-public',
  redirect_uri: `http://localhost:3000/signin-callback`,
  post_logout_redirect_uri: `http://localhost:3000/`,
  scope: 'openid profile email',
  automaticSilentRenew: true,
  // userStore: new WebStorageStateStore({ store }),
};

const userManager = new UserManager(oidcConfig);

export default userManager;
