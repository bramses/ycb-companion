import userManager from '@/libs/oidc';

interface AuthedFetchOptions extends RequestInit {
  maxRetries?: number;
}

/**
 * Helper function to attempt silent token renewal
 * Currently disabled to prevent infinite authentication loops
 */
async function renewToken(): Promise<boolean> {
  // Silent token renewal disabled - always return false
  // This forces immediate redirect to interactive login when tokens expire
  return false;
}

/**
 * Authenticated fetch wrapper that automatically handles 401 errors
 * by redirecting to interactive login (silent renewal disabled)
 */
export async function authedFetch(
  url: string,
  options: AuthedFetchOptions = {},
): Promise<Response> {
  const { maxRetries = 1, ...fetchOptions } = options;

  // First attempt
  try {
    const response = await fetch(url, fetchOptions);

    if (response.ok) {
      return response;
    }

    // If we got a 401 and have retries left, try to refresh the token
    if (response.status === 401 && maxRetries > 0) {
      // eslint-disable-next-line no-console
      console.log('authedFetch: Got 401, attempting silent token refresh');

      const tokenRenewed = await renewToken();

      if (tokenRenewed) {
        // eslint-disable-next-line no-console
        console.log(
          'authedFetch: Token refreshed successfully, retrying request',
        );

        // Retry the request with fresh token
        const retryResponse = await fetch(url, fetchOptions);
        return retryResponse;
      }
      // If token renewal failed, redirect to login
      const currentPath = window.location.pathname;
      userManager.signinRedirect({ state: currentPath });
      return response; // Return original 401 response
    }

    // For other errors or no retries left, return the response
    return response;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('authedFetch: Request failed:', error);
    throw error;
  }
}

/**
 * Convenience wrapper for POST requests with JSON body
 */
export async function authedPost(
  url: string,
  data: any,
  options: AuthedFetchOptions = {},
): Promise<Response> {
  return authedFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
    ...options,
  });
}
