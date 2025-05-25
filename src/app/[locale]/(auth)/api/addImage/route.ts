import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getAccessToken } from '@/utils/getAccessToken';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const { CLOUD_URL } = process.env;

  const TOKEN = getAccessToken();

  if (!TOKEN) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  try {
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
    console.log('formData entries:', entries);

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
    if (formData.get('metadata')) {
      forwardForm.append('metadata', formData.get('metadata')!);
    }

    if (formData.get('parent_id')) {
      forwardForm.append('parent_id', formData.get('parent_id')!);
    }

    const proxyRes = await fetch(`${CLOUD_URL}/v2/addImage`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
      body: forwardForm,
    });

    const data = await proxyRes.json();
    return NextResponse.json(data, { status: proxyRes.status });
  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
