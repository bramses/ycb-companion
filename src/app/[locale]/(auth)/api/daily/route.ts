import { NextResponse } from 'next/server';

import { logger } from '@/libs/Logger';

// import env variables

export const POST = async (request: Request) => {
  const { date } = await request.json();
  const { CLOUD_URL, DATABASE_URL } = process.env;

  const resp = await fetch(`${CLOUD_URL}/entriesByDate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      excludeParentId: true,
      date,
      dbPath: DATABASE_URL,
    }),
  });
  logger.info('resp:', resp);
  const data = await resp.json();

  try {
    logger.info(`A new daily has been created ${JSON.stringify(data)}`);

    return NextResponse.json({
      data,
    });
  } catch (error) {
    logger.error(error, 'An error occurred while creating a search');

    return NextResponse.json({}, { status: 500 });
  }
};
