/* eslint-disable react/no-array-index-key */

'use client';

// import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface UploaderProps {
  closeModal: () => void;
  textDefault: string;
  titleDefault: string;
  authorDefault: string;
}

const Uploader = ({
  closeModal,
  textDefault,
  titleDefault,
  authorDefault,
}: UploaderProps) => {
  console.log(textDefault);
  console.log(titleDefault);
  console.log(authorDefault);
  // const { user, isLoaded } = useUser();
  const router = useRouter();
  const [author, setAuthor] = useState('');

  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
    console.log('submitting:', {
      url: data,
      metadata,
    });
    for (const field of Object.keys(argMetadata)) {
      if (argMetadata[field] !== undefined) {
        metadata[field] = argMetadata[field]!;
      }
    }

    const response = await fetch('/api/addURL', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: data,
        metadata,
      }),
    });
    const responseData = await response.json();

    return responseData;
  };

  return (
    <div className="[&_p]:my-6">
      <div className="flex w-full">
        <input
          type="text"
          style={{ fontSize: '17px' }}
          id="modal-message-author"
          className="mt-2 block grow rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          placeholder="A URL for your entry..."
          onChange={(e) => setAuthor(e.target.value)}
          value={author}
        />
      </div>
      <button
        type="button"
        className="mt-2 block w-full rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        onClick={async () => {
          try {
            const responseEntry = await add(author, {});
            if (responseEntry.respData) {
              router.push(`/dashboard/entry/${responseEntry.respData.id}`);
              closeModal();
            }
          } catch (err) {
            setShowError(true);
            setErrorMessage('Unable to add entry. Please try again.');
          }
        }}
      >
        Add Entry
      </button>

      {showError && <p>{errorMessage}</p>}

      {loading && <p>Loading...</p>}
    </div>
  );
};

export default Uploader;
