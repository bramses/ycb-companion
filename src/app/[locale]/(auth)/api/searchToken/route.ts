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
    const resp = await fetch(`${CLOUD_URL}/token`, {
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
      logger.error(`Failed to create token: ${resp.status}`);
      return NextResponse.json({}, { status: resp.status });
    }

    const token = await resp.json();
    logger.info(`A new token has been created${JSON.stringify(token)}`);
    return NextResponse.json({ token });
  } catch (error) {
    logger.error(error, 'An error occurred while creating a token');
    return NextResponse.json({}, { status: 500 });
  }
};
