'use client';

import { useEffect, useState } from 'react';

const Logo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width="14px"
    height="16px"
    viewBox="0 0 14 16"
    version="1.1"
  >
    <defs />
    <g id="flow" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g
        id="0-default"
        transform="translate(-121.000000, -40.000000)"
        fill="#e184df"
      >
        <path
          d="M127,50 L126,50 C123.238576,50 121,47.7614237 121,45 C121,42.2385763 123.238576,40 126,40 L135,40 L135,56 L133,56 L133,42 L129,42 L129,56 L127,56 L127,50 Z M127,48 L127,42 L126,42 C124.343146,42 123,43.3431458 123,45 C123,46.6568542 124.343146,48 126,48 L127,48 Z"
          id="pilcrow"
        />
      </g>
    </g>
  </svg>
);

const ProductDisplay = () => (
  <section>
    <div className="product">
      <Logo />
      <div className="description">
        <h3>synthesis plan</h3>
        <h5>$20.00 / month</h5>
      </div>
    </div>
    <form action="http://localhost:3001/create-checkout-session" method="post">
      <input type="hidden" name="lookup_key" value="Synthesis-3e71bbf" />
      <button id="checkout-and-portal-button" type="submit">
        checkout
      </button>
    </form>
    <div className="product">
      <Logo />
      <div className="description">
        <h3>search plan</h3>
        <h5>$10.00 / month</h5>
      </div>
    </div>
    <form action="http://localhost:3001/create-checkout-session" method="post">
      <input type="hidden" name="lookup_key" value="Search-cee65bc" />
      <button id="checkout-and-portal-button" type="submit">
        checkout
      </button>
    </form>
  </section>
);

const SuccessDisplay = ({ sessionId }: { sessionId: string }) => (
  <section>
    <div className="product Box-root">
      <Logo />
      <div className="description Box-root">
        <h3>subscription to starter plan successful!</h3>
      </div>
    </div>
    <form action="http://localhost:3001/create-portal-session" method="post">
      <input
        type="hidden"
        id="session-id"
        name="session_id"
        value={sessionId}
      />
      <button id="checkout-and-portal-button" type="submit">
        manage your billing information
      </button>
    </form>
  </section>
);

const MessageDisplay = ({ message }: { message: string }) => (
  <section>
    <p>{message}</p>
  </section>
);

export default function StripePage() {
  const [messageText, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    // check if this is a redirect back from checkout
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      setSuccess(true);
      setSessionId(query.get('session_id') || '');
    }
    if (query.get('canceled')) {
      setSuccess(false);
      setMessage(
        "order canceled -- continue to shop around and checkout when you're ready.",
      );
    }
  }, []);

  if (!success && messageText === '') {
    return <ProductDisplay />;
  }
  if (success && sessionId !== '') {
    return <SuccessDisplay sessionId={sessionId} />;
  }
  return <MessageDisplay message={messageText} />;
}
