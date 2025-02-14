'use server';

import { signIn } from 'auth';

export async function loginAction(formData: FormData) {
  const share = formData.get('share');
  if (share) {
    await signIn('keycloak', { redirectTo: `/dashboard?share=${share}` });
  } else {
    await signIn('keycloak', { redirectTo: '/dashboard' });
  }
}
