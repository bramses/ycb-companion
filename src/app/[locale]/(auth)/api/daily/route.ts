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
    const { date } = await request.json();

    const resp = await fetch(`${CLOUD_URL}/entriesByDate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        excludeParentId: false,
        date,
        // get the timezone from the user's browser
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    });

    if (!resp.ok) {
      logger.error(`Failed to fetch daily entries: ${resp.status}`);
      return NextResponse.json(
        { error: `Failed to fetch daily entries: ${resp.status}` },
        { status: resp.status },
      );
    }

    const data = await resp.json();
    logger.info(`Daily entries fetched successfully`);

    return NextResponse.json({ data });
  } catch (error) {
    logger.error(error, 'An error occurred while fetching daily entries');
    return NextResponse.json(
      { error: 'An error occurred while fetching daily entries' },
      { status: 500 },
    );
  }
};
