import { auth } from 'auth';
import { redirect } from 'next/navigation';

import Login from '@/components/Login';

const signinErrors: Record<string | 'default', string> = {
  default: 'Unable to sign in.',
  signin: 'Try signing in with a different account.',
  oauthsignin: 'Try signing in with a different account.',
  oauthcallbackerror: 'Try signing in with a different account.',
  oauthcreateaccount: 'Try signing in with a different account.',
  emailcreateaccount: 'Try signing in with a different account.',
  callback: 'Try signing in with a different account.',
  oauthaccountnotlinked:
    'To confirm your identity, sign in with the same account you used originally.',
  sessionrequired: 'Please sign in to access this page.',
};

interface SignInPageProp {
  searchParams: {
    callbackUrl: string;
    error: string;
  };
}

export default async function Signin({
  searchParams: { callbackUrl, error },
}: SignInPageProp) {
  const session = await auth();
  if (session) {
    redirect(callbackUrl || '/');
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-3">
      {error && <div>{signinErrors[error.toLowerCase()]}</div>}
      <Login url={callbackUrl} />
    </div>
  );
}
