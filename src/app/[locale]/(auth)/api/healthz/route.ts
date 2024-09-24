// /api/healthz
import { NextResponse } from 'next/server';

export const GET = async (_: Request) => {
  return NextResponse.json({
    status: 'ok',
  });
};
