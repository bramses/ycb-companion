import Cookies from 'js-cookie';
import { UserManager } from 'oidc-client-ts';

// OIDC_AUTHORITY=http://localhost:8080/realms/ycb
// OIDC_CLIENT_ID=ycb
// OIDC_REDIRECT_URI=http://localhost:3000/signin-callback
// OIDC_LOGOUT_REDIRECT_URI=http://localhost:3000/

const oidcConfig = {
  authority: process.env.NEXT_PUBLIC_OIDC_AUTHORITY!,
  client_id: process.env.NEXT_PUBLIC_OIDC_CLIENT_ID!,
  redirect_uri: process.env.NEXT_PUBLIC_OIDC_REDIRECT_URI!,
  post_logout_redirect_uri: process.env.NEXT_PUBLIC_OIDC_LOGOUT_REDIRECT_URI!,
  scope: 'openid profile email',
  automaticSilentRenew: true,
  silent_redirect_uri: process.env.NEXT_PUBLIC_OIDC_SILENT_REDIRECT_URI!,
  accessTokenExpiringNotificationTime: 60,
  // userStore: new WebStorageStateStore({ store }),
};

// prod tester
// const oidcConfig = {
//   authority: 'https://yourcommonbase.com/keycloak/realms/ycb',
//   client_id: 'ycb',
//   redirect_uri: 'https://yourcommonbase.com/signin-callback',
//   post_logout_redirect_uri: 'https://yourcommonbase.com/',
//   scope: 'openid profile email',
//   automaticSilentRenew: true,
//   // userStore: new WebStorageStateStore({ store }),
// };

const userManager = new UserManager(oidcConfig);

userManager.events.addAccessTokenExpired(() => {
  console.log('Access token expired');
  userManager
    .signinSilent()
    .then((user) => Cookies.set('user', JSON.stringify(user)))
    .catch((error) => {
      console.warn('silent renew expired, sending to login', error);
      userManager.signinRedirect();
    });
});

userManager.events.addSilentRenewError((error) => {
  console.warn('silent renew failed, sending to login', error);
  userManager.signinRedirect();
});

export default userManager;
