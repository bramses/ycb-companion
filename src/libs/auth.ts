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
    // async jwt({ token, account }: any) {
    //   if (account) {
    //     console.log(account)
    //     return {
    //       ...token,
    //       idToken: account.id_token,
    //       accessToken: account.access_token,
    //       refreshToken: account.refresh_token,
    //       expiresAt: Math.floor(Date.now() / 1000 + (account.expires_in || 3600)),
    //     };
    //   }
    //   if (Date.now() < token.expiresAt * 1000 - 60 * 1000) {
    //     return token;
    //   }
    //   try {
    //     const response = await requestRefreshOfAccessToken(token);

    //     const tokens: any = await response.json();

    //     if (!response.ok) throw new Error('Failed to refresh access token');

    //     const updatedToken: JWT = {
    //       ...token, // Keep the previous token properties
    //       idToken: tokens.id_token,
    //       accessToken: tokens.access_token,
    //       expiresAt: Math.floor(
    //         Date.now() / 1000 + (tokens.expires_in as number),
    //       ),
    //       refreshToken: tokens.refresh_token ?? token.refreshToken,
    //     };
    //     console.log(updatedToken)
    //     return updatedToken;
    //   } catch (error) {
    //     console.error('Error refreshing access token', error);
    //     return { ...token, error: 'RefreshAccessTokenError' };
    //   }
    // },
    async jwt({ token, account }: any) {
      if (account) {
        return {
          ...token,
          idToken: account.id_token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires:
            Date.now() + Number(account.expires_in || 3600) * 1000,
        };
      }
      if (Date.now() < token.accessTokenExpires - 60 * 1000) {
        return token;
      }
      try {
        const response = await requestRefreshOfAccessToken(token);
        const tokens = await response.json();
        if (!response.ok) throw new Error('failed to refresh access token');
        return {
          ...token,
          idToken: tokens.id_token,
          accessToken: tokens.access_token,
          accessTokenExpires: Date.now() + Number(tokens.expires_in) * 1000,
          refreshToken: tokens.refresh_token ?? token.refreshToken,
        };
      } catch (error) {
        console.error('error refreshing access token', error);
        return { ...token, error: 'RefreshAccessTokenError' };
      }
    },
    async authorized({ auth }: any) {
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth;
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
