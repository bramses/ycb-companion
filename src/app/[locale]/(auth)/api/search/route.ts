import { NextResponse } from 'next/server';

import { logger } from '@/libs/Logger';

export const POST = async (request: Request) => {
  const { query, dbPath } = await request.json();

  const resp = await fetch('https://api-gateway-electron.onrender.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      dbPath,
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
