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

// userManager.events.addUserLoaded(() => {
//   // once we’ve got a valid user, turn on silent renew
//   // userManager.settings.automaticSilentRenew = true;
//   userManager.startSilentRenew();
// });

userManager.events.addSilentRenewError((error) => {
  console.log('oi window.location.href:', window.location.href);
  console.log('silent renew failed, sending to login', error);
  userManager.signinRedirect();
});

export default userManager;
