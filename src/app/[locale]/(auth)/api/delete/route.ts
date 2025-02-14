// Import the cookies utility
import { NextResponse } from 'next/server';

import { logger } from '@/libs/Logger';
import { getAccessToken } from '@/utils/getAccessToken';

// import env variables

export const POST = async (request: Request) => {
  const { id } = await request.json();
  const { CLOUD_URL } = process.env;

  const TOKEN = getAccessToken();
  console.log(TOKEN); // Retrieve the token from cookies

  if (!TOKEN) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  const resp = await fetch(`${CLOUD_URL}/delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      platformId: id.toString(),
    }),
  });

  const data = await resp.json();

  try {
    logger.info(`A new delete has been created ${JSON.stringify(data)}`);

    return NextResponse.json({
      data,
    });
  } catch (error) {
    logger.error(error, 'An error occurred while creating a delete');

    return NextResponse.json({}, { status: 500 });
  }
};
