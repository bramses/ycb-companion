import type { DefaultSession } from 'next-auth';

declare module 'next-auth/jwt' {
  interface JWT {
    idToken?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: string;
  }
}

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    error?: string;
  }
}

// this process is know as module augmentation
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}
