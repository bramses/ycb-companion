import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const GET = async () => {
  try {
    const cookieStore = cookies();

    // Try to read existing user cookie
    const userCookie = cookieStore.get('user');

    return NextResponse.json({
      userCookie: userCookie
        ? {
            name: userCookie.name,
            value: `${userCookie.value.substring(0, 100)}...`,
            hasAccessToken: userCookie.value.includes('access_token'),
          }
        : 'no user cookie found',
      message: 'Test route for cookie debugging',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

export const POST = async () => {
  // Test setting a cookie from server side
  try {
    const response = NextResponse.json({ message: 'Cookie set from server' });

    const testUser = {
      access_token: 'test-token-123',
      id_token: 'test-id-token',
      profile: { sub: 'test-user' },
    };

    response.cookies.set('user', JSON.stringify(testUser), {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: false, // Allow client-side access
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
