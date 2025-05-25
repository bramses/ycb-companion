// Import the cookies utility
import { NextResponse } from 'next/server';

import { logger } from '@/libs/Logger';
import { getAccessToken } from '@/utils/getAccessToken';

// import env variables

export const POST = async () => {
  const { CLOUD_URL } = process.env;

  const TOKEN = getAccessToken();

  if (!TOKEN) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  const resp = await fetch(`${CLOUD_URL}/user/monthly/text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
      'x-companion-secret': process.env.COMPANION_SECRET!,
    },
    body: JSON.stringify({}),
  });
  const data = await resp.json();

  try {
    logger.info(`monthly text entries: ${JSON.stringify(data)}`);

    return NextResponse.json({
      data,
    });
  } catch (error) {
    logger.error(
      error,
      'An error occurred while fetching monthly text entries',
    );

    return NextResponse.json({}, { status: 500 });
  }
};
