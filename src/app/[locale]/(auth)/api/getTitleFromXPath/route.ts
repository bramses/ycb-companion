import { NextResponse } from 'next/server';

import { logger } from '@/libs/Logger';

export const POST = async (request: Request) => {
  const { XPATH_API_KEY } = process.env;
  const { url } = await request.json();

  const titleURL = 'https://the-things-i-do-for-titles.onrender.com/get-title';

  const resp = await fetch(titleURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      apiKey: XPATH_API_KEY,
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
