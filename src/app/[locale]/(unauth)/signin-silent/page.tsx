import { Suspense } from 'react';

import SignIn from './SignInSilent';

export const dynamic = 'force-dynamic'; // disable static prerender

export default function Page() {
  return (
    <Suspense fallback={<p>loading signin silent</p>}>
      <SignIn />
    </Suspense>
  );
}
