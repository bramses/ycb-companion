import { cookies } from 'next/headers';

export const getAccessToken = () => {
  try {
    // get access token from user in cookies
    const user = cookies().get('user');

    if (!user) {
      return null;
    }

    // Check for invalid cookie content
    if (user.value === 'undefined' || user.value === 'null') {
      // eslint-disable-next-line no-console
      console.log('Invalid cookie value detected, clearing cookie');
      // Cannot directly clear server-side cookie, return null
      return null;
    }

    let userData;
    try {
      userData = JSON.parse(user.value);
    } catch (parseError) {
      // eslint-disable-next-line no-console
      console.log('failed to parse user cookie:', parseError);
      // eslint-disable-next-line no-console
      console.log('Cookie value was:', user.value);
      return null;
    }

    // check if access_token is present
    if (!userData) {
      // eslint-disable-next-line no-console
      console.log('no userData after parsing');
      return null;
    }

    // Check for access_token in different possible locations
    const accessToken =
      userData.access_token || userData.accessToken || userData.token;

    if (!accessToken) {
      // eslint-disable-next-line no-console
      console.log(
        'no access_token in userData, available keys:',
        Object.keys(userData),
      );
      return null;
    }

    return accessToken;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in getAccessToken:', error);
    return null;
  }
};
