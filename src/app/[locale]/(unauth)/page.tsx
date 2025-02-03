import Link from 'next/link';

export default function Index() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="container mx-auto px-4">
        {' '}
        {/* Added container div */}
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
        <p className="mb-8 text-lg">
          Your Commonbase is a <em>self-organizing scrapbook.</em> By using a
          scrapbook format, you can <b>save any chaotic interest you have.</b>{' '}
          Want to deeply rabbit hole the{' '}
          <a href="https://www.britannica.com/place/Denmark/The-High-Middle-Ages">
            policies of 14th century Denmark
          </a>{' '}
          for months? Want to spend one day looking into{' '}
          <a href="https://www.trees.com/gardening-and-landscaping/types-of-shovels">
            different types of shovels
          </a>
          ? Want to{' '}
          <a href="https://www.youtube.com/watch?v=NtsJ5m6C7dU">
            chronicle the weeks of a plant growing on your window sill with
            pictures
          </a>
          ? Go wild! By using vector embeddings, we can <strong>find</strong>{' '}
          <strong>anything we need</strong>. Over time, our memories of an event
          become fuzzy. We may only remember certain parts or very few parts at
          all. Your Commonbase is built to help you use these small tidbits and
          reunite with these entries! With the{' '}
          <strong>Entry/Comment Model</strong>, Your Commonbase allows you and
          your environment to evolve around your entries, keeping them useful
          time immemorial.
          <br />
          <br />
          The four functions of Your Commonbase are: 1) Storing, 2) Searching,
          3) Synthesizing, and 4) Sharing. Lets examine each of these in more
          detail.
        </p>
        <h3 className="mb-4 text-xl font-medium">Store</h3>
        <iframe
          width="420"
          height="315"
          title="YouTube video player"
          src="https://www.youtube.com/embed/tgbNymZ7vqY?autoplay=1&mute=1"
        />
      </div>{' '}
      {/* Closing container div */}
    </div>
  );
}
