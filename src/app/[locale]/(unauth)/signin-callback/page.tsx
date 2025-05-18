import { Suspense } from 'react';

import SilentCallback from './SigninCallback';

export const dynamic = 'force-dynamic'; // disable static prerender

export default function Page() {
  return (
    <Suspense fallback={<p>loading signin</p>}>
      <SilentCallback />
    </Suspense>
  );
}
