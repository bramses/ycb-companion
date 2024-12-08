// src/app/[locale]/(auth)/api/download/route.ts
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { GET } from '../getCBPath/route';

export const POST = async (request: Request) => {
  const { CLOUD_URL } = process.env;

  const dbRes = await GET(request);
  if (!dbRes) {
    return NextResponse.json({}, { status: 500 });
  }
  const { DATABASE_URL, API_KEY } = await dbRes.json();

  try {
    const resp = await fetch(`${CLOUD_URL}/downloadDB`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dbPath: DATABASE_URL,
        apiKey: API_KEY,
      }),
    });

    if (!resp.ok) {
      throw new Error('Failed to fetch data from /downloadDB');
    }

    const entriesJSON = await resp.text(); // Get the response as text
    const headers = new Headers({
      'Content-Disposition': 'attachment; filename=entries.json',
      'Content-Type': 'application/json',
    });

    logger.info('A new download has been created');
    return new Response(entriesJSON, { headers });
  } catch (error) {
    logger.error(error, 'An error occurred while creating a download');
    return NextResponse.json({}, { status: 500 });
  }
};