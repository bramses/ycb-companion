// import type { AuthOptions, TokenSet } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import KeycloakProvider from 'next-auth/providers/keycloak';

function requestRefreshOfAccessToken(token: JWT) {
  return fetch(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.KEYCLOAK_CLIENT_ID,
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: token.refreshToken! as string,
    }),
    method: 'POST',
    cache: 'no-store',
  });
}

export const authOptions: any = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      issuer: process.env.KEYCLOAK_ISSUER,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 30,
  },
  callbacks: {
    async jwt({ token, account }: any) {
      if (account) {
        const updatedToken = {
          ...token, // Copy existing properties
          idToken: account.id_token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
        };
        return updatedToken;
      }
      if (Date.now() < (token.expiresAt! as number) * 1000 - 60 * 1000) {
        return token;
      }
      try {
        const response = await requestRefreshOfAccessToken(token);

        const tokens: any = await response.json();

        if (!response.ok) throw new Error('Failed to refresh access token');

        const updatedToken: JWT = {
          ...token, // Keep the previous token properties
          idToken: tokens.id_token,
          accessToken: tokens.access_token,
          expiresAt: Math.floor(
            Date.now() / 1000 + (tokens.expires_in as number),
          ),
          refreshToken: tokens.refresh_token ?? token.refreshToken,
        };
        return updatedToken;
      } catch (error) {
        console.error('Error refreshing access token', error);
        return { ...token, error: 'RefreshAccessTokenError' };
      }
    },
    async session({ session, token }: any) {
      return {
        ...session, // Copy existing properties
        accessToken: token.accessToken,
        error: token.error,
      };
    },
  },
};
