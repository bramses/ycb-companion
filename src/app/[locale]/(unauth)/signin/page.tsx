import { Suspense } from 'react';

import SignIn from './SignIn';

export const dynamic = 'force-dynamic'; // disable static prerender

export default function Page() {
  return (
    <Suspense fallback={<p>loading signin</p>}>
      <SignIn />
    </Suspense>
  );
}
