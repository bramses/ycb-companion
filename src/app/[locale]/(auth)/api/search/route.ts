// Import the cookies utility
import { NextResponse } from 'next/server';

import { logger } from '@/libs/Logger';
import { getAccessToken } from '@/utils/getAccessToken';

// import env variables

export const POST = async (request: Request) => {
  const { query, matchCount, platformId } = await request.json();
  const { CLOUD_URL } = process.env;

  const TOKEN = getAccessToken();
  console.log(TOKEN); // Retrieve the token from cookies

  if (!TOKEN) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  if (!platformId) {
    const submittedQuery = query;

    let matchCt = matchCount;

    if (matchCt === undefined) {
      matchCt = 5;
    }

    if (matchCt > 10) {
      matchCt = 10;
    }
    if (matchCt < 1) {
      matchCt = 1;
    }

    const resp = await fetch(`${CLOUD_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        text: submittedQuery,
        matchLimit: matchCt,
        matchThreshold: 0.35,
      }),
    });

    const data = await resp.json();

    try {
      logger.info(`A new search has been created ${JSON.stringify(data)}`);

      return NextResponse.json({
        data,
      });
    } catch (error) {
      logger.error(error, 'An error occurred while creating a search');

      return NextResponse.json({}, { status: 500 });
    }
  } else {
    let matchCt = matchCount;

    if (matchCt === undefined) {
      matchCt = 5;
    }

    if (matchCt > 10) {
      matchCt = 10;
    }
    if (matchCt < 1) {
      matchCt = 1;
    }

    const resp = await fetch(`${CLOUD_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        platformId,
        matchLimit: matchCt,
        matchThreshold: 0.35,
      }),
    });

    const data = await resp.json();

    try {
      logger.info(`A new search has been created ${JSON.stringify(data)}`);

      return NextResponse.json({
        data,
      });
    } catch (error) {
      logger.error(error, 'An error occurred while creating a search');

      return NextResponse.json({}, { status: 500 });
    }
  }
};
