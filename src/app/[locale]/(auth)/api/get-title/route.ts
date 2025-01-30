import { NextResponse } from 'next/server';
import { parse } from 'node-html-parser';

function blank(text?: string): boolean {
  return !text || text.trim() === '';
}

function notBlank(text?: string): boolean {
  return !blank(text);
}

function getUrlFinalSegment(url: string): string {
  try {
    const segments = new URL(url).pathname.split('/');
    const last = segments.pop() || segments.pop();
    return last || 'file';
  } catch {
    return 'file';
  }
}

export const GET = async (req: Request) => {
  try {
    const urlParams = new URL(req.url).searchParams;
    let url = urlParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'missing url param' }, { status: 400 });
    }
    if (!(url.startsWith('http://') || url.startsWith('https://'))) {
      url = `https://${url}`;
    }

    const response = await fetch(url);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return NextResponse.json(
        { title: getUrlFinalSegment(url), description: null },
        { status: 200 },
      );
    }

    const html = await response.text();
    const root = parse(html);
    const titleNode = root.querySelector('title');
    const title = titleNode?.innerText.trim();

    if (blank(title)) {
      const noTitleAttr = titleNode?.getAttribute('no-title');
      if (notBlank(noTitleAttr)) {
        return NextResponse.json(
          { title: noTitleAttr, description: null },
          { status: 200 },
        );
      }
      return NextResponse.json(
        { title: url, description: null },
        { status: 200 },
      );
    }

    const metaDesc = root.querySelector('meta[name="description"]');
    const rawDesc = metaDesc?.getAttribute('content')?.trim();
    let description: string | null = null;
    if (notBlank(rawDesc) && rawDesc !== title) {
      description = rawDesc ?? null;
    }

    return NextResponse.json({ title, description }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'failed to scrape' }, { status: 500 });
  }
};
