import { NextResponse } from 'next/server';

import { logger } from '@/libs/Logger';

import { GET } from '../getCBPath/route';

// import env variables

export const POST = async (request: Request) => {
  const { id, data, metadata } = await request.json();
  const { CLOUD_URL } = process.env;

  const dbRes = await GET(request);
  if (!dbRes) {
    return NextResponse.json({}, { status: 500 });
  }
  const { DATABASE_URL, API_KEY } = await dbRes.json();

  const resp = await fetch(`${CLOUD_URL}/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: id.toString(),
      dbPath: DATABASE_URL,
      data,
      metadata,
      apiKey: API_KEY,
    }),
  });
  logger.info('resp:', resp);
  const respData = await resp.json();

  try {
    logger.info(`A new fetch has been created ${JSON.stringify(respData)}`);

    return NextResponse.json({
      respData,
    });
  } catch (error) {
    logger.error(error, 'An error occurred while creating a search');

    return NextResponse.json({}, { status: 500 });
  }
};