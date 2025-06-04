// Import the cookies utility
import { NextResponse } from 'next/server';

import { logger } from '@/libs/Logger';
import { getAccessToken } from '@/utils/getAccessToken';

// import env variables

export const POST = async (request: Request) => {
  const { CLOUD_URL } = process.env;

  const TOKEN = getAccessToken();

  if (!TOKEN) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  try {
    const { limit } = await request.json();

    const resp = await fetch(`${CLOUD_URL}/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ limit }),
    });

    if (!resp.ok) {
      logger.error(`Failed to fetch log entries: ${resp.status}`);
      return NextResponse.json(
        { error: `Failed to fetch log entries: ${resp.status}` },
        { status: resp.status },
      );
    }

    const data = await resp.json();
    logger.info(`Log entries fetched successfully`);

    return NextResponse.json({ data });
  } catch (error) {
    logger.error(error, 'An error occurred while fetching log entries');
    return NextResponse.json(
      { error: 'An error occurred while fetching log entries' },
      { status: 500 },
    );
  }
};
