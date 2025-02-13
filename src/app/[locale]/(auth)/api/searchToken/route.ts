// src/app/[locale]/(auth)/api/download/route.ts
import { cookies } from 'next/headers'; // Import the cookies utility
import { NextResponse } from 'next/server';

import { logger } from '@/libs/Logger';

export const POST = async () => {
  const { CLOUD_URL } = process.env;

  const TOKEN = cookies().get('platformToken')?.value; // Retrieve the token from cookies

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
