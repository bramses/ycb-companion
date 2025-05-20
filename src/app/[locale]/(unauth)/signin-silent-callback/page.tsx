import { Suspense } from 'react';

import SilentCallback from './SilentCallback';

export const dynamic = 'force-dynamic'; // disable static prerender

export default function Page() {
  return (
    <Suspense fallback={<p>loading silent renew…</p>}>
      <SilentCallback />
    </Suspense>
  );
}
