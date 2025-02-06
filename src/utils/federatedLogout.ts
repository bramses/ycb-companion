import { signOut } from 'auth';

export default async function federatedLogout() {
  try {
    const response = await fetch('/api/federated-logout');
    const data = await response.json();
    console.log(data);
    if (response.ok) {
      await signOut();
      window.location.href = data.url;
      return;
    }
    throw new Error(data.error);
  } catch (error) {
    console.log(error);
    // alert(error);
    // await signOut();
    // window.location.href = "/";
  }
}
