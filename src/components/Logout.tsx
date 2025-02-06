// import federatedLogout from "@/utils/federatedLogout"; // TODO: is jwt killed off?
import { signOut } from 'auth';

export default function Logout() {
  // return <button
  //   onClick={() => federatedLogout()}
  //   className="bg-sky-500 hover:bg-sky-700 px-5 py-2 text-sm leading-5 rounded-full font-semibold text-white">
  //   Signout of keycloak
  // </button>

  return (
    <form
      action={async () => {
        'use server';

        await signOut({
          redirectTo: '/',
        });
      }}
    >
      <button type="submit">Sign Out</button>
    </form>
  );
}
