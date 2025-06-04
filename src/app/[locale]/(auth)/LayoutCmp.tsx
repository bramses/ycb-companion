'use client';

import AuthProvider from '@/components/AuthProvider';
import { AppConfig } from '@/utils/AppConfig';

export default function AuthLayout(props: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // eslint-disable-next-line
  let signInUrl = '/sign-in';
  let signUpUrl = '/sign-up';
  let dashboardUrl = '/dashboard';

  if (props.params.locale !== AppConfig.defaultLocale) {
    // eslint-disable-next-line
    signInUrl = `/${props.params.locale}${signInUrl}`;
    // eslint-disable-next-line
    signUpUrl = `/${props.params.locale}${signUpUrl}`;
    // eslint-disable-next-line
    dashboardUrl = `/${props.params.locale}${dashboardUrl}`;
  }

  return <AuthProvider>{props.children}</AuthProvider>;
}
