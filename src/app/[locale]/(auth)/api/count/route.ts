import { NextResponse } from 'next/server';

import { logger } from '@/libs/Logger';

// import env variables

export const POST = async () => {
  const { CLOUD_URL, TOKEN } = process.env;


  const resp = await fetch(`${CLOUD_URL}/count`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  const data = await resp.json();

  try {
    logger.info(`A new count has been created ${JSON.stringify(data)}`);

    return NextResponse.json(
      data,
    );
  } catch (error) {
    logger.error(error, 'An error occurred while creating a count');

    return NextResponse.json({}, { status: 500 });
  }
};
