// Import the cookies utility
import { NextResponse } from 'next/server';

import { logger } from '@/libs/Logger';
import { getAccessToken } from '@/utils/getAccessToken';

// import env variables

export const POST = async (request: Request) => {
  const { data, metadata, createdAt } = await request.json();
  const { CLOUD_URL } = process.env;
  const TOKEN = getAccessToken();
  console.log(TOKEN); // Retrieve the token from cookies

  if (!TOKEN) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  const entryBody: { data: any; metadata: any; created_at?: string } = {
    data,
    metadata,
  };

  if (createdAt) {
    entryBody.created_at = createdAt;
  }

  const resp = await fetch(`${CLOUD_URL}/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify(entryBody),
  });
  logger.info('resp:', resp);
  const respData = await resp.json();

  try {
    logger.info(`A new add has been created ${JSON.stringify(respData)}`);

    return NextResponse.json({
      respData,
    });
  } catch (error) {
    logger.error(error, 'An error occurred while creating a add');

    return NextResponse.json({}, { status: 500 });
  }
};
