import { NextResponse } from 'next/server';

import { logger } from '@/libs/Logger';

export const GET = async (request: Request) => {
  // extract favicon url from query using https://s2.googleusercontent.com/s2/favicons?domain_url=https://www.stackoverflow.com

  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'Missing url query parameter' },
      { status: 400 },
    );
  }

  const favicoRes = await fetch(
    `https://s2.googleusercontent.com/s2/favicons?domain_url=${url}`,
  );
  logger.info(`Fetching favicon for ${url}`);
  logger.info(`Favicon response status: ${favicoRes.status}`);

  if (!favicoRes.ok) {
    return NextResponse.json(
      { error: 'Failed to fetch favicon' },
      { status: favicoRes.status },
    );
  }

  const faviconBuffer = await favicoRes.arrayBuffer();
  const faviconBase64 = Buffer.from(faviconBuffer).toString('base64');

  return NextResponse.json(
    { favicon: `data:image/png;base64,${faviconBase64}` },
    { status: 200 },
  );
};
