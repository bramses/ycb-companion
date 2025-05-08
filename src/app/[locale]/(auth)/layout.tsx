// TODO switch to next-auth provider

import { enUS, frFR } from '@clerk/localizations';
import { ClerkProvider } from '@clerk/nextjs';

import AuthProvider from '@/components/AuthProvider';
import userManager from '@/libs/oidc';
import { AppConfig } from '@/utils/AppConfig';

export default function AuthLayout(props: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  let clerkLocale = enUS;
  let signInUrl = '/sign-in';
  let signUpUrl = '/sign-up';
  let dashboardUrl = '/dashboard';

  if (props.params.locale === 'fr') {
    clerkLocale = frFR;
  }

  if (props.params.locale !== AppConfig.defaultLocale) {
    signInUrl = `/${props.params.locale}${signInUrl}`;
    signUpUrl = `/${props.params.locale}${signUpUrl}`;
    dashboardUrl = `/${props.params.locale}${dashboardUrl}`;
  }

  userManager.events.addAccessTokenExpired(() => {
    console.log('Access token expired -- silent renewing');
    userManager.signinSilent().catch(console.warn);
  });

  return (
    <ClerkProvider
      localization={clerkLocale}
      signInUrl={signInUrl}
      signUpUrl={signUpUrl}
      signInFallbackRedirectUrl={dashboardUrl}
      signUpFallbackRedirectUrl={dashboardUrl}
    >
      {/* {props.children}
      <iframe
        src="/signin-silent-callback"
        style={{ display: 'none' }}
        title="silent renew"
      /> */}
      <AuthProvider>
        {props.children}
        <iframe
          src="/silent-signin-callback"
          style={{ display: 'none' }}
          title="silent renew"
        />
      </AuthProvider>
    </ClerkProvider>
  );
}
