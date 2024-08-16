/* eslint-disable react/no-array-index-key */

'use client';

import { useState } from 'react';

const Upload = () => {
  const [textAreaValue, setTextAreaValue] = useState('');
  const [metadataFields, setMetadataFields] = useState([
    { key: 'author', value: 'https://ycb-companion.onrender.com/dashboard' },
    { key: 'title', value: 'by Bram Adams' },
  ]);

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

  const add = async (data: string) => {
    // get value from input fields and add to metadata
    const metadata: Record<string, string> = {};
    for (const field of metadataFields) {
      if (field.key && field.value) {
        metadata[field.key] = field.value;
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

    console.log('Added entry:', responseData);
    // clear input fields
    setTextAreaValue('');
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
    </div>
  );
};

export default Upload;
