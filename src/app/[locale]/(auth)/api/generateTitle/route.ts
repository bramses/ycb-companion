import { openai } from '@ai-sdk/openai'; // Ensure OPENAI_API_KEY environment variable is set
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

import { getAccessToken } from '@/utils/getAccessToken';

export async function POST(req: Request) {
  const { CLOUD_URL } = process.env;

  const TOKEN = getAccessToken();

  if (!TOKEN) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  const planResp = await fetch(`${CLOUD_URL}/user/plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
      'x-companion-secret': process.env.COMPANION_SECRET!,
    },
    body: JSON.stringify({}),
  });

  const planData = await planResp.json();
  const { plan } = planData;

  if (plan === 'store' || plan === 'search') {
    return NextResponse.json(
      { error: 'upgrade to synthesis plan' },
      {
        status: 401,
      },
    );
  }

  const { prompt } = await req.json();

  let { text } = await generateText({
    model: openai('gpt-4o-mini'),
    system: 'Generate a concise and descriptive title for the given prompt.',
    prompt,
  });

  // remove " from the beginning and end of the string if it exists
  text = text.replace(/^"|"$/g, '');
  return NextResponse.json({ title: text.trim() }, { status: 200 });
}
