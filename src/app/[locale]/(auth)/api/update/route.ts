import { cookies } from 'next/headers'; // Import the cookies utility
import { NextResponse } from 'next/server';

import { logger } from '@/libs/Logger';

// import env variables

export const POST = async (request: Request) => {
  const { id, data, metadata } = await request.json();
  const { CLOUD_URL } = process.env;

  const TOKEN = cookies().get('platformToken')?.value; // Retrieve the token from cookies

  if (!TOKEN) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  const resp = await fetch(`${CLOUD_URL}/update`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      platform_id: id.toString(),
      data,
      metadata,
    }),
  });
  logger.info('update resp:', resp);
  const respData = await resp.json();

  try {
    logger.info(`A new update has been created ${JSON.stringify(respData)}`);

    if (respData.error) {
      throw new Error(respData.error);
    }

    return NextResponse.json({
      respData,
    });
  } catch (error) {
    logger.error(error, 'An error occurred while creating a update');

    return NextResponse.json({}, { status: 500 });
  }
};
