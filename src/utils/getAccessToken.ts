import { cookies } from 'next/headers';

export const getAccessToken = () => {
  // get access token from user in cookies
  const user = cookies().get('user');
  if (user) {
    const userData = JSON.parse(user.value);
    return userData.access_token;
  }
  return null;
};
