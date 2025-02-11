export const fetchAccessToken = async () => {
  const user = localStorage.getItem('user');
  if (!user) {
    throw new Error('No user found in local storage');
  }
  const userData = JSON.parse(user);
  const token = userData.access_token;
  return token;
};
