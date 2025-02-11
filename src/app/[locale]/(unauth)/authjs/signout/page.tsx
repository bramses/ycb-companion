import { auth } from 'auth';
import { redirect } from 'next/navigation';

import Logout from '@/components/Logout';

export default async function SignoutPage() {
  const session = await auth();
  if (session) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-3">
        <div className="text-xl font-bold">Signout</div>
        <div>Are you sure you want to sign out?</div>
        <div>
          <Logout />
        </div>
      </div>
    );
  }
  return redirect('/api/auth/signin');
}
