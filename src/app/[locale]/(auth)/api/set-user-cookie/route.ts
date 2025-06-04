import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const POST = async (request: NextRequest) => {
  try {
    const { user } = await request.json();

    if (!user) {
      return NextResponse.json(
        { error: 'No user data provided' },
        { status: 400 },
      );
    }

    const response = NextResponse.json({ message: 'Cookie set successfully' });

    // Set cookie using NextResponse.cookies (server-side)
    response.cookies.set('user', JSON.stringify(user), {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: false, // Allow client-side access
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to set cookie',
        details: error.message,
      },
      { status: 500 },
    );
  }
};
