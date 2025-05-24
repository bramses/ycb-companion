// src/app/[locale]/(auth)/api/download/route.ts

import { NextResponse } from 'next/server';

import { logger } from '@/libs/Logger';
import { getAccessToken } from '@/utils/getAccessToken';

export async function GET() {
  const { CLOUD_URL } = process.env;
  const TOKEN = getAccessToken(); // sync? if async, await it

  if (!TOKEN) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  try {
    const resp = await fetch(`${CLOUD_URL}/downloadCSV`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    if (!resp.ok) {
      throw new Error(`Backend error: ${resp.status}`);
    }

    const csv = await resp.text(); // get csv content

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="commonbase.csv"',
      },
    });
  } catch (error) {
    logger.error(error, 'An error occurred while proxying download');
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
