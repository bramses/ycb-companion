// import { cookies } from 'next/headers';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { AppConfig } from './utils/AppConfig';

// Define the protected routes
const protectedRoutes = [
  /^\/dashboard(.*)/,
  /^\/[^/]+\/dashboard(.*)/, // Matches /:locale/dashboard(.*)
  /^\/api\/(.*)/,
];

// Function to check if a route is protected
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => route.test(pathname));
}

// Create the intl middleware
const intlMiddleware = createMiddleware({
  locales: AppConfig.locales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,
});

export default async function middleware(req: any) {
  // TODO i commented this out to test the auth
  // check for user in cookies and check if it's expired
  const user = cookies().get('user');

  let session = false;
  if (user) {
    const userData = JSON.parse(user.value);
    if (user && userData) {
      const currentTime = Math.floor(Date.now() / 1000);

      if (!userData) {
        const newURL = new URL('/signin', req.nextUrl.origin);
        const callbackUrl = req.nextUrl.href.replace(req.nextUrl.origin, ''); // Get the full URL as the callback
        console.log('1 callbackUrl:', callbackUrl);
        newURL.searchParams.set('callbackUrl', callbackUrl); // Add callbackUrl as a query parameter
        const response = NextResponse.redirect(newURL);
        response.cookies.set('routeTo', callbackUrl, { path: '/' });
        return response;
      }

      if (userData.expires_at > currentTime) {
        session = true;
      } else {
        if (
          isProtectedRoute(req.nextUrl.pathname) &&
          !req.nextUrl.pathname.includes('/signin')
        ) {
          const callbackUrl = req.nextUrl.href.replace(req.nextUrl.origin, ''); // Get the full URL as the callback
          console.log('2 callbackUrl:', callbackUrl);
          const newURL = new URL('/signin-silent', req.nextUrl.origin);
          newURL.searchParams.set('callbackUrl', callbackUrl); // Add callbackUrl as a query parameter
          return Response.redirect(newURL);
        }
        return intlMiddleware(req);
      }
    }
    if (
      !session &&
      isProtectedRoute(req.nextUrl.pathname) &&
      !req.nextUrl.pathname.includes('/signin')
    ) {
      console.log(`3 ${req.nextUrl.href}`); // TODO test this on deployed version where middleware doesnt loop
      const callbackUrl = req.nextUrl.href.replace(req.nextUrl.origin, ''); // Get the full URL as the callback
      const newUrl = new URL('/signin', req.nextUrl.origin);
      console.log('3 callbackUrl:', callbackUrl);
      newUrl.searchParams.set('callbackUrl', callbackUrl); // Add callbackUrl as a query parameter
      console.log('3 newUrl:', newUrl.toString());
      const response = NextResponse.redirect(newUrl);
      response.cookies.set('routeTo', callbackUrl, { path: '/' });
      return response;
    }
  } else if (
    isProtectedRoute(req.nextUrl.pathname) &&
    !req.nextUrl.pathname.includes('/signin')
  ) {
    console.log(`4 ${req.nextUrl.href}`); // TODO test this on deployed version where middleware doesnt loop
    const callbackUrl = req.nextUrl.href.replace(req.nextUrl.origin, ''); // Get the full URL as the callback
    const newUrl = new URL('/signin', req.nextUrl.origin);
    console.log('4 callbackUrl:', callbackUrl);

    newUrl.searchParams.set('callbackUrl', callbackUrl); // Add callbackUrl as a query parameter

    // TODO abhorrent hack to get around the middleware loop, setting the callback url as a cookie
    // set routeTo to the callback url
    const response = NextResponse.redirect(newUrl);
    response.cookies.set('routeTo', callbackUrl, { path: '/' });
    return response;
  }

  // Apply intlMiddleware for all requests
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next|monitoring|^/ws/).*)',
    '/',
    '/(api|trpc)(.*)',
  ], // Also exclude tunnelRoute used in Sentry from the matcher
};
