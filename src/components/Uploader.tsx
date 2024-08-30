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

  // const apiKey = 'apikeyyyy'; // todo get from env
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

  const add = async (data: string) => {
    // get value from input fields and add to metadata
    // set to loading
    setLoading(true);
    const metadata = {
      author,
      title,
    };

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

  // TODO: implement image upload

  // const uploadImage = async () => {
  //   const fileInput = document.getElementById('file-input');
  //   if (!fileInput) return;
  //   (fileInput as HTMLInputElement).click();

  //   fileInput.addEventListener('change', async (event) => {
  //     const file = (event.target as HTMLInputElement).files?.[0];
  //     if (!file) return;

  //     const formData = new FormData();
  //     formData.append('file', file);
  //     setLoading(true);
  //     const response = await fetch(
  //       'https://commonbase-supabase-alpha.onrender.com/cf-images/upload',
  //       {
  //         method: 'POST',
  //         headers: {
  //           Authorization: `Bearer ${apiKey}`,
  //         },
  //         body: formData,
  //       },
  //     );
  //     const data = await response.json();
  //     console.log('Image uploaded:', data);
  //     const pngUrl = `${data.url}?format=png`;
  //     console.log('PNG URL:', pngUrl);

  //     const response2 = await fetch(
  //       'https://commonbase-supabase-alpha.onrender.com/cf-images/describe',
  //       {
  //         method: 'POST',
  //         headers: {
  //           Authorization: `Bearer ${apiKey}`,
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({ imageUrl: pngUrl }),
  //       },
  //     );
  //     const data2 = await response2.json();
  //     console.log('Image description:', data2);
  //     // put img description in text area
  //     setTextAreaValue(data2.data);

  //     setTitle('Image');
  //     setAuthor(data2.metadata.imageUrl);
  //     await add(data2.description);

  //     setLoading(false);
  //   });
  // };

  return (
    <div className="[&_p]:my-6">
      {/* an input field for your name and then a textarea and a button to submit to /api/add */}

      <textarea
        id="modal-message"
        rows={4}
        className="mt-4 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        placeholder="Your message..."
        value={textAreaValue}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.metaKey) {
            add(textAreaValue);
          }
        }}
        onChange={(e) => setTextAreaValue(e.target.value)}
      />
      <input
        type="text"
        className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        placeholder={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.metaKey) {
            add(textAreaValue);
          }
        }}
        value={title}
      />
      <input
        type="text"
        className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        placeholder={author}
        onChange={(e) => setAuthor(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.metaKey) {
            add(textAreaValue);
          }
        }}
        value={author}
      />
      <button
        type="button"
        className="mt-2 block w-full rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        onClick={() => add(textAreaValue)}
      >
        Add Entry (or press cmd/ctrl + enter)
      </button>
      <div className="inline-flex w-full items-center justify-center">
        <hr className="my-8 h-px w-64 border-0 bg-gray-200 dark:bg-gray-700" />
        <span className="absolute left-1/2 -translate-x-1/2 bg-white px-3 font-medium text-gray-900 dark:bg-gray-900 dark:text-white">
          or
        </span>
      </div>

      <p>
        <em>image upload coming soon, use /dashboard/upload for now</em>
      </p>

      {/* <div className="inline-flex w-full items-center justify-center">
        <hr className="my-8 h-px w-64 border-0 bg-gray-200 dark:bg-gray-700" />
        <span className="absolute left-1/2 -translate-x-1/2 bg-white px-3 font-medium text-gray-900 dark:bg-gray-900 dark:text-white">
          or
        </span>
      </div>
      <button
        type="button"
        className="mt-2 block w-full rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        onClick={uploadImage}
      >
        Upload Image
      </button> */}
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default Uploader;
