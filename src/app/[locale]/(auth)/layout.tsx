import { Suspense } from 'react';

import LayoutCmp from './LayoutCmp';

export const dynamic = 'force-dynamic'; // disable static prerender

export default function Page({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <Suspense fallback={<p>loading layoutCmp</p>}>
      <LayoutCmp params={params}>{children}</LayoutCmp>
    </Suspense>
  );
}
