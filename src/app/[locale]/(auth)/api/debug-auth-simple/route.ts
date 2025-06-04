import { NextResponse } from 'next/server';

export const GET = async () => {
  try {
    return NextResponse.json({
      message: 'Auth debug endpoint working',
      timestamp: new Date().toISOString(),
      server: 'responding',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 },
    );
  }
};
