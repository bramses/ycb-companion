// Import the cookies utility
import console from 'console';
import { NextResponse } from 'next/server';

import { getAccessToken } from '@/utils/getAccessToken';

// import env variables

export const POST = async (request: Request) => {
  const { CLOUD_URL } = process.env;

  const TOKEN = getAccessToken();

  if (!TOKEN) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    console.log('invalid content-type:', contentType);
    return NextResponse.json(
      { error: 'Invalid content type' },
      { status: 400 },
    );
  }

  const formData = await request.formData();
  // debug log of incoming fields
  const entries = [];
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      entries.push([key, `File: ${value.name} (${value.size} bytes)`]);
    } else {
      entries.push([key, value]);
    }
  }

  const fileField = formData.get('file');
  if (!fileField) {
    return NextResponse.json(
      { error: 'No file field in form data' },
      { status: 400 },
    );
  }

  const fileBlob = fileField as Blob;
  const filename = fileField instanceof File ? fileField.name : 'file';

  // forward file to Express endpoint
  const forwardForm = new FormData();
  forwardForm.append('file', fileBlob, filename);

  const proxyRes = await fetch(`${CLOUD_URL}/user/setProfilePicture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'x-companion-secret': process.env.COMPANION_SECRET!,
    },
    body: forwardForm,
  });

  console.log('proxyRes:', proxyRes);

  const data = await proxyRes.json();
  return NextResponse.json(data, { status: proxyRes.status });
};
