'use client';

import { useChat } from 'ai/react';
import ReactMarkdown from 'react-markdown';

// Define the custom link component outside of the Chat component
const CustomLink = (props: any) => (
  <a
    target="_blank"
    className="text-blue-600 hover:underline"
    rel="noopener noreferrer"
    href={props.href}
  >
    {props.children}
  </a>
);

export default function Chat({ seedMessages }: { seedMessages: string[] }) {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    initialMessages: seedMessages.map((content, index) => ({
      id: `seed-${index}`,
      role: 'user',
      content,
    })),
  });

  // Display only non-seed messages
  const messagesToDisplay = messages.filter(
    (message) => !message.id.startsWith('seed-'),
  );

  return (
    <>
      {messagesToDisplay.map((message: any) => (
        <div key={message.id}>
          {message.role === 'user' ? 'You: ' : 'YCB: '}
          <ReactMarkdown
            components={{
              a: CustomLink, // Use the custom link component here
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          name="prompt"
          value={input}
          onChange={handleInputChange}
          className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Chat with YCB"
        />
        <button
          type="submit"
          className="mt-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          Chat
        </button>
        <br />
      </form>
    </>
  );
}
