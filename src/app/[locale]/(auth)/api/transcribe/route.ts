/*

(base) bram@brams-macbook ycb-core % curl -X POST http://localhost:8088/transcribe \
  -H "Content-Type: multipart/form-data" \
  -F "audio=@grids.m4a"

  */

import { NextResponse } from 'next/server';

export const POST = async (request: Request) => {
  const formData = await request.formData();
  const audio = formData.get('audio'); // retrieve the audio file
  const { CLOUD_URL } = process.env;

  if (!audio || !(audio instanceof File)) {
    return NextResponse.json(
      { error: 'No audio file provided' },
      { status: 400 },
    );
  }

  const form = new FormData();
  form.append('audio', audio); // append the audio file to the form data

  const resp = await fetch(`${CLOUD_URL}/transcribe`, {
    method: 'POST',
    body: form, // use the form data
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
