/*

(base) bram@brams-macbook ycb-core % curl -X POST http://localhost:8088/transcribe \
  -H "Content-Type: multipart/form-data" \
  -F "audio=@grids.m4a"

  */

import { NextResponse } from 'next/server';

import { logger } from '@/libs/Logger';

import { GET } from '../getCBPath/route';

export const POST = async (request: Request) => {
  const formData = await request.formData();
  const audio = formData.get('audio'); // retrieve the audio file
  logger.info('audio:', formData);

  if (!audio || !(audio instanceof File)) {
    return NextResponse.json(
      { error: 'No audio file provided' },
      { status: 400 },
    );
  }

  // Check file size (assuming audio.size is available)
  if (audio.size > 24 * 1024 * 1024) {
    return NextResponse.json(
      { error: 'File size must be less than 24MB' },
      { status: 400 },
    );
  }

  const { CLOUD_URL } = process.env;
  const dbRes = await GET(request);
  if (!dbRes) {
    return NextResponse.json({}, { status: 500 });
  }
  const { DATABASE_URL, API_KEY } = await dbRes.json();

  const form = new FormData();
  form.append('audio', audio); // append the audio file to the form data
  form.append('apiKey', API_KEY); // append the API key
  form.append('dbPath', DATABASE_URL); // append the database path

  logger.info('form:', form);

  const resp = await fetch(`${CLOUD_URL}/transcribe`, {
    method: 'POST',
    body: form, // send the form data directly
  });

  const data = await resp.json();

  try {
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'An error occurred while transcribing' },
      { status: 500 },
    );
  }
};
