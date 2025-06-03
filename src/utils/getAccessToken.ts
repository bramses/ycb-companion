import { cookies } from 'next/headers';

export const getAccessToken = () => {
  // get access token from user in cookies
  const user = cookies().get('user');
  if (user) {
    const userData = JSON.parse(user.value);

    // check if access_token is present
    if (!userData) {
      console.log('no userData');
      return null;
    }

    if (!userData.access_token) {
      console.log('no access_token');
      return null;
    }
    return userData.access_token;
  }
  return null;
};
