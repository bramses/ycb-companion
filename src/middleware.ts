// // import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
// import type { NextFetchEvent, NextRequest } from 'next/server';
// import createMiddleware from 'next-intl/middleware';
// // export { auth as middleware } from "auth"
// import { AppConfig } from './utils/AppConfig';

// const intlMiddleware = createMiddleware({
//   locales: AppConfig.locales,
//   localePrefix: AppConfig.localePrefix,
//   defaultLocale: AppConfig.defaultLocale,
// });

// // const isProtectedRoute = createRouteMatcher([
// //   '/dashboard(.*)',
// //   '/:locale/dashboard(.*)',
// //   '/api/(.*)',
// // ]);

// export default function middleware(
//   request: NextRequest,
//   event: NextFetchEvent,
// ) {
//   console.log('request.nextUrl.pathname:', request.nextUrl.pathname);
//   // Run Clerk middleware only when it's necessary
//   // if (
//   //   request.nextUrl.pathname.includes('/sign-in') ||
//   //   request.nextUrl.pathname.includes('/sign-up') ||
//   //   isProtectedRoute(request)
//   // ) {
//   //   return clerkMiddleware((auth, req) => {
//   //     if (isProtectedRoute(req)) {
//   //       const locale =
//   //         req.nextUrl.pathname.match(/(\/.*)\/dashboard/)?.at(1) ?? '';

//   //       const signInUrl = new URL(`${locale}/sign-in`, req.url);

//   //       auth().protect({
//   //         // `unauthenticatedUrl` is needed to avoid error: "Unable to find `next-intl` locale because the middleware didn't run on this request"
//   //         unauthenticatedUrl: signInUrl.toString(),
//   //       });
//   //     }

//   //     return intlMiddleware(req);
//   //   })(request, event);
//   // }

//   return intlMiddleware(request);
// }

// export const config = {
//   matcher: [
//     '/((?!.+\\.[\\w]+$|_next|monitoring|^/ws/).*)',
//     '/',
//     '/(api|trpc)(.*)',
//   ], // Also exclude tunnelRoute used in Sentry from the matcher
// };

// v2

// import { auth } from 'auth';
// // import type { NextFetchEvent, NextRequest } from "next/server";
// import createMiddleware from 'next-intl/middleware';

// import { AppConfig } from './utils/AppConfig';

// // Define the protected routes
// const protectedRoutes = [
//   /^\/dashboard(.*)/,
//   /^\/[^/]+\/dashboard(.*)/, // Matches /:locale/dashboard(.*)
//   /^\/api\/(.*)/,
// ];

// // Function to check if a route is protected
// function isProtectedRoute(pathname: string): boolean {
//   return protectedRoutes.some((route) => route.test(pathname));
// }

// // Create the intl middleware
// const intlMiddleware = createMiddleware({
//   locales: AppConfig.locales,
//   localePrefix: AppConfig.localePrefix,
//   defaultLocale: AppConfig.defaultLocale,
// });

// export default async function middleware(req: any) {
//   const session = await auth();
//   if (
//     !session &&
//     isProtectedRoute(req.nextUrl.pathname) &&
//     !req.nextUrl.pathname.includes('/auth')
//   ) {
//     console.log(req.nextUrl);
//     const callbackUrl = req.nextUrl.href.replace(req.nextUrl.origin, ''); // Get the full URL as the callback
//     const newUrl = new URL('/auth/signin', req.nextUrl.origin);
//     newUrl.searchParams.set('callbackUrl', callbackUrl); // Add callbackUrl as a query parameter
//     return Response.redirect(newUrl); // TODO: does the auth need await now that i added routes to exclude auth?
//     // return intlMiddleware(req);
//   }

//   // Apply intlMiddleware for all requests
//   return intlMiddleware(req);
// }

// export const config = {
//   matcher: [
//     '/((?!.+\\.[\\w]+$|_next|monitoring|^/ws/).*)',
//     '/',
//     '/(api|trpc)(.*)',
//   ], // Also exclude tunnelRoute used in Sentry from the matcher
// };

// v3

// import { getToken } from "next-auth/jwt"
// import { NextResponse } from "next/server"
// import type { NextRequest } from "next/server"
// import createMiddleware from "next-intl/middleware"
// import { AppConfig } from "./utils/AppConfig"

// export async function middleware(req: NextRequest) {
//   const token = await getToken({ req })
//   console.log('token:', token)
//   const protectedRoutes = [
//     /^\/dashboard(.*)/,
//     /^\/[^/]+\/dashboard(.*)/,
//     /^\/api\/(.*)/,
//   ]
//   const isProtected = protectedRoutes.some((r) => r.test(req.nextUrl.pathname))

//   if (isProtected && !token) {
//     return NextResponse.redirect(new URL("/auth/signin", req.url))
//   }

//   // run intl middleware for all requests
//   const intlMw = createMiddleware({
//     locales: AppConfig.locales,
//     localePrefix: AppConfig.localePrefix,
//     defaultLocale: AppConfig.defaultLocale,
//   })
//   return intlMw(req)
// }

// export const config = {
//   matcher: [
//     '/((?!.+\\.[\\w]+$|_next|monitoring|^/ws/).*)',
//     '/',
//     '/(api|trpc)(.*)',
//   ],
// }

// // v4

// export { auth as middleware } from "auth"

// export const config = {
//   matcher: [
//     '/((?!.+\\.[\\w]+$|_next|monitoring|^/ws/).*)',
//     '/',
//     '/(api|trpc)(.*)',
//   ],
// }

// v5

// import type { NextFetchEvent, NextRequest } from "next/server";
import { cookies } from 'next/headers';
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
  // check for user in cookies and check if it's expired
  const user = cookies().get('user');
  let session = false;
  if (user) {
    const userData = JSON.parse(user.value);
    const currentTime = Math.floor(Date.now() / 1000);
    console.log('currentTime:', currentTime);
    console.log('userData.expires_at:', userData.expires_at);
    console.log(
      'userData.expires_at > currentTime:',
      userData.expires_at > currentTime,
    );
    if (userData.expires_at > currentTime) {
      session = true;
      console.log('session is true');
    }
  }
  console.log('session:', session);
  if (
    !session &&
    isProtectedRoute(req.nextUrl.pathname) &&
    !req.nextUrl.pathname.includes('/signin')
  ) {
    const callbackUrl = req.nextUrl.href.replace(req.nextUrl.origin, ''); // Get the full URL as the callback
    const newUrl = new URL('/signin', req.nextUrl.origin);
    newUrl.searchParams.set('callbackUrl', callbackUrl); // Add callbackUrl as a query parameter
    return Response.redirect('http://localhost:3000/signin'); // TODO: does the auth need await now that i added routes to exclude auth?
    // return intlMiddleware(req);
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
