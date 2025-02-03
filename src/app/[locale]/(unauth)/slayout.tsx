import Link from 'next/link';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="mb-6 text-4xl font-bold">Welcome to YCB Companion</h1>
      <div className="mb-8 flex space-x-4">
        <Link href="/sign-in" className="text-blue-500 hover:underline">
          Login
        </Link>
        <Link href="/sign-up" className="text-blue-500 hover:underline">
          Register
        </Link>
        <Link href="/about" className="text-blue-500 hover:underline">
          About
        </Link>
      </div>
      <h2 className="mb-4 text-2xl font-semibold">Features</h2>
      <p className="mb-8 text-lg">This is a feature list</p>
      <h3 className="mb-4 text-xl font-medium">Store</h3>
      <iframe
        width="420"
        height="315"
        title="YouTube video player"
        src="https://www.youtube.com/embed/tgbNymZ7vqY?autoplay=1&mute=1"
      />
    </div>
  );
}
