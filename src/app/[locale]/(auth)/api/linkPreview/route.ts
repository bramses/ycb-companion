import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import ogs from 'open-graph-scraper';

export async function GET(request: NextRequest) {
  // get url from query param
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'No url provided' }, { status: 400 });
  }
  const { error, result } = await ogs({ url, timeout: 10000 });
  if (error) return NextResponse.json({ error });

  const imageUrl = Array.isArray(result.ogImage)
    ? result.ogImage[0]?.url
    : result.ogImage || '';

  console.log({
    title: result.ogTitle || result.twitterTitle || '',
    description: result.ogDescription || result.twitterDescription || '',
    image: imageUrl || '',
    domain: new URL(url).hostname.replace('www.', ''),
  });

  return NextResponse.json({
    title: result.ogTitle || result.twitterTitle || '',
    description: result.ogDescription || result.twitterDescription || '',
    image: imageUrl || '',
    domain: new URL(url).hostname.replace('www.', ''),
  });
}
