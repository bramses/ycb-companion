import { NextResponse } from 'next/server';

import { logger } from '@/libs/Logger';

// import env variables

export const POST = async (_: Request) => {
  const { CLOUD_URL, DATABASE_URL } = process.env;

  const resp = await fetch(`${CLOUD_URL}/random`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dbPath: DATABASE_URL,
    }),
  });
  logger.info('resp:', resp);
  const data = await resp.json();

  try {
    logger.info(`A new random has been created ${JSON.stringify(data)}`);

    return NextResponse.json({
      data,
    });
  } catch (error) {
    logger.error(error, 'An error occurred while creating a search');

    return NextResponse.json({}, { status: 500 });
  }
};