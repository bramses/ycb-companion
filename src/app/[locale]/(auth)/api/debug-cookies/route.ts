import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const GET = async () => {
  try {
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    const userCookie = cookieStore.get('user');

    return NextResponse.json({
      allCookies: allCookies.map((c) => ({
        name: c.name,
        value: `${c.value.substring(0, 100)}...`,
      })),
      userCookie: userCookie
        ? {
            name: userCookie.name,
            value: `${userCookie.value.substring(0, 200)}...`,
            fullValue: userCookie.value,
          }
        : null,
      debug: 'Cookie debugging info',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
