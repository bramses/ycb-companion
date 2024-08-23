import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(_: Request) {
  const { userId }: { userId: string | null } = auth();

  if (!userId) return null;

  const user = await clerkClient.users.getUser(userId);
  return NextResponse.json({
    DATABASE_URL: user.privateMetadata.cbPath,
    API_KEY: user.privateMetadata.apiKey,
  });
}
