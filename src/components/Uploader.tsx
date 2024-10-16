/* eslint-disable react/no-array-index-key */

'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

const Uploader = () => {
  const { user, isLoaded } = useUser();
  const [textAreaValue, setTextAreaValue] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState(
    'https://ycb-companion.onrender.com/dashboard',
  );
  const [firstLastName, setFirstLastName] = useState({
    firstName: '',
    lastName: '',
  });

  const apiKey = process.env.NEXT_PUBLIC_API_KEY_CF_IMG;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    // set first name as title
    if (user?.firstName && user?.lastName) {
      setTitle(`${user.firstName} ${user.lastName}`);
      setFirstLastName({
        firstName: user.firstName,
        lastName: user.lastName,
      });
    }
  }, [isLoaded, user]);

  const add = async (
    data: string,
    argMetadata: Record<string, string> = {
      author: '',
      title: '',
    },
  ) => {
    // get value from input fields and add to metadata
    // set to loading
    setLoading(true);
    // const metadata = {
    //   author,
    //   title,
    // };

    const metadata: Record<string, string> = {};
    console.log('argMetadata:', argMetadata);
    for (const field of Object.keys(argMetadata)) {
      if (argMetadata[field] !== undefined) {
        metadata[field] = argMetadata[field]!;
      }
    }

    const response = await fetch('/api/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data,
        metadata,
      }),
    });
    const responseData = await response.json();

    console.log('Response:', responseData);

    // clear input fields
    setTextAreaValue('');

    if (firstLastName.firstName && firstLastName.lastName) {
      setTitle(`${firstLastName.firstName} ${firstLastName.lastName}`);
    } else {
      setTitle('');
    }
    setAuthor('https://ycb-companion.onrender.com/dashboard');
    setLoading(false);
    // refocus on text area
    const modalMessage = document.getElementById('modal-message');
    if (modalMessage) {
      modalMessage.focus();
    }
  };

  const uploadAudio = async () => {
    const fileInput = document.getElementById('file-input-audio');
    if (!fileInput) return;
    (fileInput as HTMLInputElement).click();

    fileInput.addEventListener('change', async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setLoading(true);
      const formData = new FormData();
      formData.append('audio', file);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData, // This mimics your curl -F "audio=@test.m4a"
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const { transcription, cfURL } = data;
      console.log('Transcribe response:', data);

      console.log('Audio description:', `${transcription} - ${cfURL}`);

      add(data.data.transcription, {
        author: data.data.cfURL,
        title: 'Audio',
      });
      setLoading(false);

      // const reader = new FileReader();
      // reader.onload = () => {
      //   const arrayBuffer = reader.result;
      //   setLoading(true);

      //   const worker = new Worker('/audioWorker.js');
      //   worker.postMessage({ file: arrayBuffer, apiKey });

      //   worker.onmessage = (e) => {
      //     const { success, data, error } = e.data;
      //     if (success) {
      //       console.log('Audio description:', data);
      //       // add(data.transcription, {
      //       //   author: data.cfURL,
      //       //   title: 'Audio',
      //       // });
      //     } else {
      //       console.error('Error:', error);
      //     }
      //     setLoading(false);
      //   };
      // };
      // reader.readAsArrayBuffer(file);
    });
  };

  const uploadImage = async () => {
    const fileInput = document.getElementById('file-input-modal');
    if (!fileInput) return;
    (fileInput as HTMLInputElement).click();

    fileInput.addEventListener('change', async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result;
        setLoading(true);

        const worker = new Worker('/imageWorker.js');
        worker.postMessage({ file: arrayBuffer, apiKey });

        worker.onmessage = (e) => {
          const { success, data, error } = e.data;
          if (success) {
            console.log('Image description:', data);
            add(data.data, {
              author: data.metadata.imageUrl,
              title: 'Image',
            });
          } else {
            console.error('Error:', error);
          }
          setLoading(false);
        };
      };
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <div className="[&_p]:my-6">
      {/* an input field for your name and then a textarea and a button to submit to /api/add */}

      <textarea
        id="modal-message"
        rows={4}
        style={{ fontSize: '17px' }}
        className="mt-4 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        placeholder="Your message..."
        value={textAreaValue}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.metaKey) {
            add(textAreaValue, {
              author,
              title,
            });
          }
        }}
        onChange={(e) => setTextAreaValue(e.target.value)}
      />
      <input
        type="text"
        style={{ fontSize: '17px' }}
        className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        placeholder={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.metaKey) {
            add(textAreaValue, { author, title });
          }
        }}
        value={title}
      />
      <input
        type="text"
        style={{ fontSize: '17px' }}
        className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        placeholder={author}
        onChange={(e) => setAuthor(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.metaKey) {
            add(textAreaValue, { author, title });
          }
        }}
        value={author}
      />
      <button
        type="button"
        className="mt-2 block w-full rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        onClick={() => add(textAreaValue, { author, title })}
      >
        Add Entry (or press cmd/ctrl + enter)
      </button>
      <div className="inline-flex w-full items-center justify-center">
        <hr className="my-8 h-px w-64 border-0 bg-gray-200 dark:bg-gray-700" />
        <span className="absolute left-1/2 -translate-x-1/2 bg-white px-3 font-medium text-gray-900 dark:bg-gray-900 dark:text-white">
          or
        </span>
      </div>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        id="file-input-modal"
      />
      <button
        type="button"
        onClick={uploadImage}
        className="mt-2 block rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Upload Image
      </button>
      <div className="inline-flex w-full items-center justify-center">
        <hr className="my-8 h-px w-64 border-0 bg-gray-200 dark:bg-gray-700" />
        <span className="absolute left-1/2 -translate-x-1/2 bg-white px-3 font-medium text-gray-900 dark:bg-gray-900 dark:text-white">
          or
        </span>
      </div>
      <input
        type="file"
        accept="audio/*"
        className="hidden"
        id="file-input-audio"
      />
      <button
        type="button"
        onClick={uploadAudio}
        className="mt-2 block rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Upload Audio -- not a worker like image, leave modal open while
        loading!!
      </button>
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default Uploader;
