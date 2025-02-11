// Import the cookies utility
import { NextResponse } from 'next/server';

import { logger } from '@/libs/Logger';

// import env variables

export const POST = async (request: Request) => {
  const { CLOUD_URL } = process.env;
  const { TOKEN } = await request.json();

  if (!TOKEN) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

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

    return NextResponse.json(data);
  } catch (error) {
    logger.error(error, 'An error occurred while creating a count');

    return NextResponse.json({}, { status: 500 });
  }
};
