import NextAuth from 'next-auth';

import { authOptions } from './src/libs/auth';

export const { auth, handlers, signIn, signOut } = NextAuth(authOptions);
