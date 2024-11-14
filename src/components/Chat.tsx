'use client';

import { useChat } from 'ai/react';
import ReactMarkdown from 'react-markdown';

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
      {messagesToDisplay.map((message) => (
        <div key={message.id}>
          {message.role === 'user' ? 'User: ' : 'AI: '}
          <ReactMarkdown
          components={{
            a: props => (
              <a
                
                target="_blank"
                className='text-blue-600 hover:underline'
                rel="noopener noreferrer"
                href={props.href}
              >
              {props.children}
              </a>
            ),
          }}
          >{message.content}</ReactMarkdown>
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input name="prompt" value={input} onChange={handleInputChange} />
        <button type="submit">ChatYCB</button>
      </form>
    </>
  );
}