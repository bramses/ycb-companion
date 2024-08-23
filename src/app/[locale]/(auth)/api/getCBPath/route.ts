import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

export async function GET(_: Request) {
  const { userId }: { userId: string | null } = auth();

  if (!userId) return null;

  const cachedData = cache.get(userId);
  if (cachedData) {
    console.log('Returning cached data');
    return NextResponse.json(cachedData);
  }

  const user = await clerkClient.users.getUser(userId);

  const data = {
    DATABASE_URL: user.privateMetadata.cbPath,
    API_KEY: user.privateMetadata.apiKey,
  };

  cache.set(userId, data);

  return NextResponse.json(data);
}
