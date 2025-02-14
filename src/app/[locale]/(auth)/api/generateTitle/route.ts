import { openai } from '@ai-sdk/openai'; // Ensure OPENAI_API_KEY environment variable is set
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const { text } = await generateText({
    model: openai('gpt-4o'),
    system: 'Generate a concise and descriptive title for the given prompt.',
    prompt,
  });

  return NextResponse.json({ title: text.trim() }, { status: 200 });
}
