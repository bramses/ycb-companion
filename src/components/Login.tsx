import { signIn } from 'auth';

export default function Login({ url }: any) {
  return (
    <form
      action={async () => {
        'use server';

        if (url) {
          await signIn('keycloak', { redirectTo: url });
        } else {
          await signIn('keycloak', { redirectTo: '/dashboard' });
        }
      }}
    >
      <button
        type="submit"
        className="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold leading-5 text-white hover:bg-sky-700"
      >
        Sign in
      </button>
    </form>
  );
}

// 'use client';

// import { useSearchParams } from 'next/navigation';

// import { loginAction } from '@/utils/loginAction';

// export default function Login() {
//   const searchParams = useSearchParams();
//   const shareParam = searchParams.get('share') || '';

//   return (
//     <form action={loginAction}>
//       <input type="hidden" name="share" value={shareParam} />
//       <button
//         type="submit"
//         className="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold leading-5 text-white hover:bg-sky-700"
//       >
//         sign in
//       </button>
//     </form>
//   );
// }
