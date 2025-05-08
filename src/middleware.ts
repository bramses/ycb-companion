// import { cookies } from 'next/headers';
import createMiddleware from 'next-intl/middleware';

import { AppConfig } from './utils/AppConfig';

// Define the protected routes
// const protectedRoutes = [
//   /^\/dashboard(.*)/,
//   /^\/[^/]+\/dashboard(.*)/, // Matches /:locale/dashboard(.*)
//   /^\/api\/(.*)/,
// ];

// Function to check if a route is protected
// function isProtectedRoute(pathname: string): boolean {
//   return protectedRoutes.some((route) => route.test(pathname));
// }

// Create the intl middleware
const intlMiddleware = createMiddleware({
  locales: AppConfig.locales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,
});

export default async function middleware(req: any) {
  // TODO i commented this out to test the auth
  // check for user in cookies and check if it's expired
  // const user = cookies().get('user');
  // let session = false;
  // if (user) {
  //   const userData = JSON.parse(user.value);
  //   const currentTime = Math.floor(Date.now() / 1000);

  //   if (userData.expires_at > currentTime) {
  //     session = true;
  //   } else {
  //     console.log('user is expired');
  //   }
  // }
  // if (
  //   !session &&
  //   isProtectedRoute(req.nextUrl.pathname) &&
  //   !req.nextUrl.pathname.includes('/signin')
  // ) {
  //   const callbackUrl = req.nextUrl.href.replace(req.nextUrl.origin, ''); // Get the full URL as the callback
  //   const newUrl = new URL('/signin', req.nextUrl.origin);
  //   newUrl.searchParams.set('callbackUrl', callbackUrl); // Add callbackUrl as a query parameter
  //   return Response.redirect(newUrl); // TODO: does the auth need await now that i added routes to exclude auth?
  //   // return Response.redirect('http://localhost:3000/signin'); // TODO: does the auth need await now that i added routes to exclude auth?
  //   // return intlMiddleware(req);
  // }

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
