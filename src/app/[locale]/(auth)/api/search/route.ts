import { NextResponse } from 'next/server';

import { logger } from '@/libs/Logger';

// import env variables

export const POST = async (request: Request) => {
  const { query, matchCount } = await request.json();
  const { CLOUD_URL, TOKEN } = process.env;

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
      matchThreshold: 0.5,
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
};
