'use client';

import { signIn } from 'next-auth/react';

export default function Login() {
  return (
    <button
      onClick={() => signIn('keycloak')}
      type="button"
      className="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold leading-5 text-white hover:bg-sky-700"
    >
      Signin with keycloak
    </button>
  );
}
