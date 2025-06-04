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

  try {
    const resp = await fetch(`${CLOUD_URL}/count`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    if (!resp.ok) {
      logger.error(`Failed to fetch count: ${resp.status}`);
      return NextResponse.json(
        { error: `Failed to fetch count: ${resp.status}` },
        { status: resp.status },
      );
    }

    const data = await resp.json();
    logger.info(`Count fetched successfully: ${JSON.stringify(data)}`);

    return NextResponse.json(data);
  } catch (error) {
    logger.error(error, 'An error occurred while fetching count');
    return NextResponse.json(
      { error: 'An error occurred while fetching count' },
      { status: 500 },
    );
  }
};
