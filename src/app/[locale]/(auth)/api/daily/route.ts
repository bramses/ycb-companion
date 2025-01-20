import { NextResponse } from 'next/server';

import { logger } from '@/libs/Logger';

// import env variables

export const POST = async (request: Request) => {
  const { date } = await request.json();
  const { CLOUD_URL, TOKEN } = process.env;
  logger.info(`REQUEST ${date}`);
  logger.info(`CLOUD_URL ${CLOUD_URL}`);
  logger.info(`TOKEN ${TOKEN}`);

  const resp = await fetch(`${CLOUD_URL}/entriesByDate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      excludeParentId: true,
      date,
    }),
  });
  const data = await resp.json();

  try {
    logger.info(`A new daily has been created ${JSON.stringify(data)}`);

    return NextResponse.json({
      data,
    });
  } catch (error) {
    logger.error(error, 'An error occurred while creating a daily');

    return NextResponse.json({}, { status: 500 });
  }
};
