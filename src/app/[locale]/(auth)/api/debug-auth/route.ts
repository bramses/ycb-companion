import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { getAccessToken } from '@/utils/getAccessToken';

export const GET = async () => {
  try {
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    const userCookie = cookieStore.get('user');
    const token = getAccessToken();

    return NextResponse.json({
      message: 'Debug authentication state',
      cookies: {
        total: allCookies.length,
        userCookie: userCookie
          ? {
              exists: true,
              preview: `${userCookie.value.substring(0, 100)}...`,
            }
          : null,
        token: token ? 'Found' : 'Not found',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    );
  }
};
