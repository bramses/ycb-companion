import { NextResponse } from 'next/server';

import { logger } from '@/libs/Logger';

import { GET } from '../getCBPath/route';

// import env variables

export const POST = async (request: Request) => {
  const { CLOUD_URL } = process.env;

  const filterModel = {
    metadata: {
      filterType: 'text',
      type: 'contains',
      filter: 'isStarred',
    },
  };

  const dbRes = await GET(request);
  if (!dbRes) {
    return NextResponse.json({}, { status: 500 });
  }
  const { DATABASE_URL, API_KEY } = await dbRes.json();

  const resp = await fetch(`${CLOUD_URL}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: '',
      dbPath: DATABASE_URL,
      apiKey: API_KEY,
      filterModel,
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
