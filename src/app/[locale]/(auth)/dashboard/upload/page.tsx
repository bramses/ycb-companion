/* eslint-disable react/no-array-index-key */

'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

import { clearCache } from '@/helpers/old_cache';

const Upload = () => {
  const { user, isLoaded } = useUser();
  const [textAreaValue, setTextAreaValue] = useState('');
  const [metadataFields, setMetadataFields] = useState([
    { key: 'author', value: 'https://ycb-companion.onrender.com/dashboard' },
    { key: 'title', value: 'by me' },
  ]);
  const apiKey = 'apikeyyyy'; // todo get from env
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    // set first name as title
    if (user?.firstName) {
      setMetadataFields([
        {
          key: 'author',
          value: 'https://ycb-companion.onrender.com/dashboard',
        },
        { key: 'title', value: `${user.firstName} ${user.lastName}` },
      ]);
    }
  }, [isLoaded, user]);

  const addField = () => {
    setMetadataFields([...metadataFields, { key: '', value: '' }]);
  };

  const handleFieldChange = (
    index: number,
    field: keyof (typeof metadataFields)[number],
    value: string,
  ) => {
    const newFields = [...metadataFields];
    if (newFields[index]) {
      newFields[index][field] = value;
      setMetadataFields(newFields);
    }
  };

  const add = async (
    data: string,
    argMetadata: Record<string, string> = {},
  ) => {
    // get value from input fields and add to metadata
    let metadata: Record<string, string>;
    if (!argMetadata || Object.keys(argMetadata).length === 0) {
      metadata = {};
      for (const field of metadataFields) {
        if (field.key && field.value) {
          metadata[field.key] = field.value;
        }
      }
    } else {
      metadata = argMetadata;
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

    console.log('Added entry:', responseData);
    // clear input fields
    setTextAreaValue('');
  };

  const uploadImage = async () => {
    // const fileInput = document.getElementById('file-input');
    // if (!fileInput) return;
    // (fileInput as HTMLInputElement).click();

    // fileInput.addEventListener('change', async (event) => {
    //   const file = (event.target as HTMLInputElement).files?.[0];
    //   if (!file) return;

    //   const formData = new FormData();
    //   formData.append('file', file);
    //   setLoading(true);

    //   const worker = new Worker('/uploadWorker.js');
    //   worker.postMessage({ formData, apiKey });

    //   worker.onmessage = (e) => {
    //     const { success, data, error } = e.data;
    //     if (success) {
    //       console.log('Image description:', data);
    //       add(data.data, {
    //         author: data.metadata.imageUrl,
    //         title: 'Image',
    //       });
    //     } else {
    //       console.error('Error:', error);
    //     }
    //     setLoading(false);
    //   };
    //   // const response = await fetch(
    //   //   'https://commonbase-supabase-alpha.onrender.com/cf-images/upload',
    //   //   {
    //   //     method: 'POST',
    //   //     headers: {
    //   //       Authorization: `Bearer ${apiKey}`,
    //   //     },
    //   //     body: formData,
    //   //   },
    //   // );
    //   // const data = await response.json();
    //   // console.log('Image uploaded:', data);
    //   // const pngUrl = `${data.url}?format=png`;
    //   // console.log('PNG URL:', pngUrl);

    //   // const response2 = await fetch(
    //   //   'https://commonbase-supabase-alpha.onrender.com/cf-images/describe',
    //   //   {
    //   //     method: 'POST',
    //   //     headers: {
    //   //       Authorization: `Bearer ${apiKey}`,
    //   //       'Content-Type': 'application/json',
    //   //     },
    //   //     body: JSON.stringify({ imageUrl: pngUrl }),
    //   //   },
    //   // );
    //   // const data2 = await response2.json();
    //   // console.log('Image description:', data2);

    //   // add(data2.data, {
    //   //   author: data2.metadata.imageUrl,
    //   //   title: 'Image',
    //   // });

    //   // setLoading(false);
    // });
    const fileInput = document.getElementById('file-input');
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
      <h1 className="[&_p]:text-2xl [&_p]:font-bold [&_p]:text-gray-900 [&_p]:dark:text-white">
        Upload
      </h1>
      <textarea
        id="message"
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
      {/* input fields and add buttons for key, values that can be optionally added to metadata, put title and author in by default */}
      <div id="metadata-fields">
        {metadataFields.map((field, index) => (
          <div key={`${index}`} className="mt-2 flex space-x-2">
            <input
              type="text"
              className="block w-1/2 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="Key"
              value={field.key}
              // if key is title or author, don't allow to change
              disabled={field.key === 'title' || field.key === 'author'}
              onChange={(e) => handleFieldChange(index, 'key', e.target.value)}
            />
            <input
              type="text"
              className="block w-1/2 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="Value"
              value={field.value}
              onChange={(e) =>
                handleFieldChange(index, 'value', e.target.value)
              }
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addField}
          className="mt-2 block rounded-lg bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
        >
          Add
        </button>
      </div>

      <button
        type="button"
        onClick={() => add(textAreaValue)}
        className="mb-2 me-2 mt-4 w-full rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Upload
      </button>

      {/* file input */}
      <input type="file" accept="image/*" className="hidden" id="file-input" />
      <button
        type="button"
        onClick={uploadImage}
        className="mt-2 block rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Upload Image
      </button>
      {loading && <p>Loading...</p>}
      <button
        type="button"
        onClick={clearCache}
        className="mt-2 block rounded-lg bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
      >
        Clear Cache
      </button>
      <a
        href="https://chatgpt.com/g/g-L05Oy6FrY-create-ycb-entry"
        target="_blank"
        className="inline-flex items-center font-medium text-blue-600 hover:underline"
      >
        Create Upload w/ ChatGPT
        <svg
          className="ms-2.5 size-3 rtl:rotate-[270deg]"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 18 18"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778"
          />
        </svg>
      </a>
    </div>
  );
};

export default Upload;
