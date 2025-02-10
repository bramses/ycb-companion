import Link from 'next/link';

export default function Index() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="container mx-auto px-4">
        {' '}
        {/* Added container div */}
        <h1 className="mb-6 text-4xl font-bold">
          Welcome to Your Commonbase Companion
        </h1>
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
          Your Commonbase is a <em>self-organizing scrapbook.</em>Your
          Commonbase provides zero stress for humans on four core
          functionalities: storing, searching, synthesizing, and sharing
          personal knowledge. From a technical standpoint, Your Commonbase is a
          vector database that has a dual layer: one for user-inputted data that
          becomes embedded, and another for machine/human metadata. The metadata
          column holds features about the data, including IDs its related to, or
          what source URL it came from, etc. By using a scrapbook format, you
          can <b>save any chaotic interest you have.</b> Want to deeply rabbit
          hole the{' '}
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
        <p>We can store from our web browser with the Chrome Extension!</p>
        <iframe
          style={{
            width: '420px', // for desktop
            maxWidth: '80%', // for mobile
          }}
          height="315"
          title="YouTube video player"
          src="https://www.youtube.com/embed/5zlXAS1npYc"
        />
        <p>We can upload text from an iOS shortcut, anywhere on our device!</p>
        <iframe
          style={{
            width: '420px', // for desktop
            maxWidth: '80%', // for mobile
          }}
          height="315"
          title="YouTube video player"
          src="https://www.youtube.com/embed/BE9b6qvlC_4"
        />
        <p>Add text directly from your dashboard!</p>
        <iframe
          style={{
            width: '420px', // for desktop
            maxWidth: '80%', // for mobile
          }}
          height="315"
          title="YouTube video player"
          src="https://www.youtube.com/embed/sut-q2pXuBE"
        />
        <p>
          Whats a self organizing scrapbook without being able to upload images
          from our phone?
        </p>
        <iframe
          style={{
            width: '420px', // for desktop
            maxWidth: '80%', // for mobile
          }}
          height="315"
          title="YouTube video player"
          src="https://www.youtube.com/embed/xHKxNYTnRKM"
        />
        <p>And we can upload screenshots to the dashboard too!</p>
        <iframe
          style={{
            width: '420px', // for desktop
            maxWidth: '80%', // for mobile
          }}
          height="315"
          title="YouTube video player"
          src="https://www.youtube.com/embed/hBp_qOU7gBg"
        />
        <p>Upload Audio from your phone too!</p>
        <iframe
          style={{
            width: '420px', // for desktop
            maxWidth: '80%', // for mobile
          }}
          height="315"
          title="YouTube video player"
          src="https://www.youtube.com/embed/KYTbpLnUWxE"
        />
        <p>Use the iOS share sheet to upload URLs!</p>
        <iframe
          style={{
            width: '420px', // for desktop
            maxWidth: '80%', // for mobile
          }}
          height="315"
          title="YouTube video player"
          src="https://www.youtube.com/embed/VATg9th2Lio"
        />
        <h3 className="mb-4 text-xl font-medium">Synthesize</h3>
        <p>Adding comments from the Chrome Extension is a breeze!</p>
        <iframe
          style={{
            width: '420px', // for desktop
            maxWidth: '80%', // for mobile
          }}
          height="315"
          title="YouTube video player"
          src="https://www.youtube.com/embed/dNCHxb9pnl0"
        />
        <p>
          Use comments to extend your entries neighborhood of relationships!
        </p>
        <iframe
          style={{
            width: '420px', // for desktop
            maxWidth: '80%', // for mobile
          }}
          height="315"
          title="YouTube video player"
          src="https://www.youtube.com/embed/yT1_jGcnFgg"
        />
        <p>View Related Entries automatically generated by YCB!</p>
        <iframe
          style={{
            width: '420px', // for desktop
            maxWidth: '80%', // for mobile
          }}
          height="315"
          title="YouTube video player"
          src="https://www.youtube.com/embed/zgej1VjHA0o"
        />
        <p>Use the Inbox to easily find entries you havent commented on yet</p>
        <iframe
          style={{
            width: '420px', // for desktop
            maxWidth: '80%', // for mobile
          }}
          height="315"
          title="YouTube video player"
          src="https://www.youtube.com/embed/bEsTU6zkKyg"
        />
        <p>Star entries to save them for later!</p>
        <iframe
          style={{
            width: '420px', // for desktop
            maxWidth: '80%', // for mobile
          }}
          height="315"
          title="YouTube video player"
          src="https://www.youtube.com/embed/K6CwMYnw_hE"
        />
        <p>Use wikilinks to emphasize parts of your entries!</p>
        <iframe
          style={{
            width: '420px', // for desktop
            maxWidth: '80%', // for mobile
          }}
          height="315"
          title="YouTube video player"
          src="https://www.youtube.com/embed/qg5lhXyPuwg"
        />
        <p>Expand your graph with comments to discover new connections!</p>
        <iframe
          style={{
            width: '420px', // for desktop
            maxWidth: '80%', // for mobile
          }}
          height="315"
          title="YouTube video player"
          src="https://www.youtube.com/embed/0tPd8jnhgvY"
        />
        <p>Use ChatYCB to converse with your entries!</p>
        <iframe
          style={{
            width: '420px', // for desktop
            maxWidth: '80%', // for mobile
          }}
          height="315"
          title="YouTube video player"
          src="https://www.youtube.com/embed/p3wiazFNh30"
        />
        <h3 className="mb-4 text-xl font-medium">Search</h3>
        <p>Use the search bar in companion to semantic search your entries!</p>
        <iframe
          style={{
            width: '420px', // for desktop
            maxWidth: '80%', // for mobile
          }}
          height="315"
          title="YouTube video player"
          src="https://www.youtube.com/embed/ll2JhwdGawQ"
        />
        <p>search from iOS!</p>
        <iframe
          style={{
            width: '420px', // for desktop
            maxWidth: '80%', // for mobile
          }}
          height="315"
          title="YouTube video player"
          src="https://www.youtube.com/embed/-1wbNHjZJns"
        />
        <p>Or search from your browser!</p>
        <iframe
          style={{
            width: '420px', // for desktop
            maxWidth: '80%', // for mobile
          }}
          height="315"
          title="YouTube video player"
          src="https://www.youtube.com/embed/BdQPCL8YRXA"
        />
        <p>
          Press the random button or press r on your keyboard to open a random
          entry!
        </p>
        <iframe
          style={{
            width: '420px', // for desktop
            maxWidth: '80%', // for mobile
          }}
          height="315"
          title="YouTube video player"
          src="https://www.youtube.com/embed/W5b6WjwVF7Q"
        />
        <p>View entries in a timeline per day!</p>
        <iframe
          style={{
            width: '420px', // for desktop
            maxWidth: '80%', // for mobile
          }}
          height="315"
          title="YouTube video player"
          src="https://www.youtube.com/embed/pVDhuZrl-yI"
        />
        <p>You can also see images in the calendar view!</p>
        <iframe
          style={{
            width: '420px', // for desktop
            maxWidth: '80%', // for mobile
          }}
          height="315"
          title="YouTube video player"
          src="https://www.youtube.com/embed/2Bn58CfONV4"
        />
        <h3 className="mb-4 text-xl font-medium">Share</h3>
        <p>Use Google Docs Extension to access your entries!</p>
        <iframe
          style={{
            width: '420px', // for desktop
            maxWidth: '80%', // for mobile
          }}
          height="315"
          title="YouTube video player"
          src="https://www.youtube.com/embed/aeq5Th7GDWE"
        />
      </div>{' '}
      {/* Closing container div */}
    </div>
  );
}

// import Link from 'next/link';

// export default function Index() {
//   return (
//     <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
//       <div className="container mx-auto px-4">
//         {' '}
//         {/* Added container div */}
//         <h1 className="mb-6 text-4xl font-bold">
//           Welcome to Your Commonbase Companion
//         </h1>
//         <div className="mb-8 flex space-x-4">
//           <Link href="/sign-in" className="text-blue-500 hover:underline">
//             Login
//           </Link>
//           <Link href="/sign-up" className="text-blue-500 hover:underline">
//             Register
//           </Link>
//           <Link href="/about" className="text-blue-500 hover:underline">
//             About
//           </Link>
//         </div>
//         <h2 className="mb-4 text-2xl font-semibold">Features</h2>
//         <p className="mb-8 text-lg">
//           Your Commonbase is a <em>self-organizing scrapbook.</em>Your
//           Commonbase provides zero stress for humans on four core
//           functionalities: storing, searching, synthesizing, and sharing
//           personal knowledge. From a technical standpoint, Your Commonbase is a
//           vector database that has a dual layer: one for user-inputted data that
//           becomes embedded, and another for machine/human metadata. The metadata
//           column holds features about the data, including IDs its related to, or
//           what source URL it came from, etc. By using a scrapbook format, you
//           can <b>save any chaotic interest you have.</b> Want to deeply rabbit
//           hole the{' '}
//           <a href="https://www.britannica.com/place/Denmark/The-High-Middle-Ages">
//             policies of 14th century Denmark
//           </a>{' '}
//           for months? Want to spend one day looking into{' '}
//           <a href="https://www.trees.com/gardening-and-landscaping/types-of-shovels">
//             different types of shovels
//           </a>
//           ? Want to{' '}
//           <a href="https://www.youtube.com/watch?v=NtsJ5m6C7dU">
//             chronicle the weeks of a plant growing on your window sill with
//             pictures
//           </a>
//           ? Go wild! By using vector embeddings, we can <strong>find</strong>{' '}
//           <strong>anything we need</strong>. Over time, our memories of an event
//           become fuzzy. We may only remember certain parts or very few parts at
//           all. Your Commonbase is built to help you use these small tidbits and
//           reunite with these entries! With the{' '}
//           <strong>Entry/Comment Model</strong>, Your Commonbase allows you and
//           your environment to evolve around your entries, keeping them useful
//           time immemorial.
//           <br />
//           <br />
//           The four functions of Your Commonbase are: 1) Storing, 2) Searching,
//           3) Synthesizing, and 4) Sharing. Lets examine each of these in more
//           detail.
//         </p>
//         {/* <VideoScroll /> */}
//       </div>{' '}
//       {/* Closing container div */}
//     </div>
//   );
// }

// import Link from 'next/link';
// import { Component } from 'react';

// class Index extends Component {
//   componentDidMount() {
//     // grab all iframes on the page
//     const iframes = document.querySelectorAll('iframe');

//     // set up the observer with a threshold of 50%
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry: any) => {
//           if (entry.isintersecting) {
//             const iframe = entry.target;
//             // only modify if we haven't already autoplayed it
//             if (!iframe.dataset.playing) {
//               let { src } = iframe;
//               // add autoplay and mute params if not already present
//               if (!src.includes('autoplay=1')) {
//                 const separator = src.includes('?') ? '&' : '?';
//                 src += `${separator}autoplay=1&mute=1`;
//                 iframe.src = src;
//                 iframe.dataset.playing = 'true';
//               }
//             }
//           }
//         });
//       },
//       { threshold: 0.5 },
//     );

//     // start observing each iframe
//     iframes.forEach((iframe) => observer.observe(iframe));
//   }

//   render() {
//     return (
//       <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
//         <div className="container mx-auto px-4">
//           <h2 className="mb-6 text-4xl font-bold">
//             welcome to your commonbase companion
//           </h2>
//           <div className="mb-8 flex space-x-4">
//             <Link href="/sign-in">
//               {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
//               <a className="text-blue-500 hover:underline">login</a>
//             </Link>
//             <Link href="/sign-up">
//               {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
//               <a className="text-blue-500 hover:underline">register</a>
//             </Link>
//             <Link href="/about">
//               {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
//               <a className="text-blue-500 hover:underline">about</a>
//             </Link>
//           </div>
//           <h2 className="mb-4 text-2xl font-semibold">features</h2>
//           <p className="mb-8 text-lg">
//             your commonbase is a self-organizing scrapbook that stores,
//             searches, synthesizes, and shares personal knowledge.
//           </p>
//           <p>this feature is x</p>
//           <iframe
//             style={{ width: '420px', maxWidth: '80%' }}
//             height="315"
//             title="youtube video player"
//             src="https://www.youtube.com/embed/5zlXAS1npYc"
//           />
//           <p>this feature is x</p>
//           <iframe
//             style={{ width: '420px', maxWidth: '80%' }}
//             height="315"
//             title="youtube video player"
//             src="https://www.youtube.com/embed/dNCHxb9pnl0"
//           />
//           {/* add more iframes as needed */}
//         </div>
//       </div>
//     );
//   }
// }

// export default Index;
