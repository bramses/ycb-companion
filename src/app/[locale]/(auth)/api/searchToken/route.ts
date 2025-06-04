// src/app/[locale]/(auth)/api/searchToken/route.ts
import { NextResponse } from 'next/server';

import { logger } from '@/libs/Logger';
import { getAccessToken } from '@/utils/getAccessToken';

export const POST = async () => {
  const { CLOUD_URL } = process.env;

  const TOKEN = getAccessToken();

  if (!TOKEN) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  try {
    const planResp = await fetch(`${CLOUD_URL}/user/plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
        'x-companion-secret': process.env.COMPANION_SECRET!,
      },
      body: JSON.stringify({}),
    });

    const planData = await planResp.json();
    const { plan } = planData;

    if (plan === 'store') {
      return NextResponse.json(
        { error: 'upgrade to search or synthesis plan' },
        {
          status: 200,
        },
      );
    }

    const resp = await fetch(`${CLOUD_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    if (!resp.ok) {
      logger.error(`Failed to create token: ${resp.status}`);
      return NextResponse.json(
        {
          error: `Failed to create token: ${resp.status}`,
        },
        { status: resp.status },
      );
    }

    const token = await resp.json();
    logger.info(`A new token has been created${JSON.stringify(token)}`);
    return NextResponse.json({ token });
  } catch (error) {
    logger.error(error, 'An error occurred while creating a token');
    return NextResponse.json(
      {
        error: 'An error occurred while creating a token',
      },
      { status: 500 },
    );
  }
};
