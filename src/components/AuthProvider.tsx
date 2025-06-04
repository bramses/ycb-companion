'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import userManager from '@/libs/oidc';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const redirectCountRef = useRef(0);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    async function bootstrap() {
      const path = window.location.pathname;
      // eslint-disable-next-line no-console
      console.log('AuthProvider bootstrap starting for path:', path);

      // Clean up any invalid cookies
      const Cookies = await import('js-cookie');
      const currentCookie = Cookies.default.get('user');
      if (currentCookie === 'undefined' || currentCookie === 'null') {
        // eslint-disable-next-line no-console
        console.log('Clearing invalid cookie');
        Cookies.default.remove('user');
      }

      // if we’re on the callback page, finish signin and redirect
      if (
        path === '/signin-callback' ||
        path === '/signin-silent-callback' ||
        path === '/signin' ||
        path === '/signin-silent'
      ) {
        setIsLoading(false);
        setIsAuthenticated(true);
        return;
      }

      try {
        const user = await userManager.getUser();
        // eslint-disable-next-line no-console
        console.log(
          'AuthProvider: getUser result:',
          user ? 'User found' : 'No user',
        );

        if (!user) {
          if (redirectCountRef.current >= 2) {
            // eslint-disable-next-line no-console
            console.error(
              'Too many redirects, stopping to prevent infinite loop',
            );
            setAuthError(
              'Authentication failed: Too many redirects. Please try refreshing the page.',
            );
            setIsLoading(false);
            setIsAuthenticated(false);
            return;
          }

          console.log('no session, redirect to signin with state', path);
          redirectCountRef.current += 1;
          setIsLoading(false);
          userManager.signinRedirect({ state: path });
          return;
        }

        if (user.expired) {
          if (redirectCountRef.current >= 2) {
            // eslint-disable-next-line no-console
            console.error(
              'Too many auth attempts, clearing session and redirecting to signin',
            );
            userManager.clearStaleState();
            setIsLoading(false);
            setIsAuthenticated(false);
            return;
          }

          console.log('token expired, interactive login required');
          redirectCountRef.current += 1;
          setIsLoading(false);
          userManager.signinRedirect({ state: path });
          return;
        }
        // Set cookie for existing user if not expired
        Cookies.default.set('user', JSON.stringify(user), {
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });

        // Note: Server-side cookie setting moved to callback handlers
        // eslint-disable-next-line no-console
        console.log('AuthProvider: User authenticated successfully');
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth bootstrap error:', error);

        if (redirectCountRef.current >= 2) {
          // eslint-disable-next-line no-console
          console.error('Too many auth errors, stopping redirects');
          setIsLoading(false);
          setIsAuthenticated(false);
          return;
        }

        redirectCountRef.current += 1;
        setIsLoading(false);
        userManager.signinRedirect({ state: path });
        return;
      }

      setIsLoading(false);
    }

    bootstrap();
  }, [router]);

  // Show loading state while checking auth
  if (isLoading) {
    return <div>Checking authentication...</div>;
  }

  // Show error state if auth failed due to too many redirects
  if (authError) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Authentication Error</h2>
        <p>{authError}</p>
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: '10px', padding: '8px 16px' }}
          type="button"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  // Only render children if authenticated or on auth pages
  if (!isAuthenticated) {
    return <div>Redirecting to login...</div>;
  }

  return children;
}
