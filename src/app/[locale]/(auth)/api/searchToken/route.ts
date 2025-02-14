// src/app/[locale]/(auth)/api/download/route.ts
import { NextResponse } from 'next/server';

import { logger } from '@/libs/Logger';
import { getAccessToken } from '@/utils/getAccessToken';

export const POST = async () => {
  const { CLOUD_URL } = process.env;

  const TOKEN = getAccessToken();
  console.log(TOKEN);

  if (!TOKEN) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  try {
    const resp = await fetch(`${CLOUD_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
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
