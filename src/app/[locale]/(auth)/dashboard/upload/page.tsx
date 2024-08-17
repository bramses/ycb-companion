/* eslint-disable react/no-array-index-key */

'use client';

import { useState } from 'react';

const Upload = () => {
  const [textAreaValue, setTextAreaValue] = useState('');
  const [metadataFields, setMetadataFields] = useState([
    { key: 'author', value: 'https://ycb-companion.onrender.com/dashboard' },
    { key: 'title', value: 'by Bram Adams' },
  ]);
  const apiKey = 'apikeyyyy';
  const [loading, setLoading] = useState(false);

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

  const uploadImage = async () => {
    const fileInput = document.getElementById('file-input');
    if (!fileInput) return;
    (fileInput as HTMLInputElement).click();

    fileInput.addEventListener('change', async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);
      setLoading(true);
      const response = await fetch(
        'https://commonbase-supabase-alpha.onrender.com/cf-images/upload',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          body: formData,
        },
      );
      const data = await response.json();
      console.log('Image uploaded:', data);
      const pngUrl = `${data.url}?format=png`;
      console.log('PNG URL:', pngUrl);

      const response2 = await fetch(
        'https://commonbase-supabase-alpha.onrender.com/cf-images/describe',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl: pngUrl }),
        },
      );
      const data2 = await response2.json();
      console.log('Image description:', data2);
      // put img description in text area
      setTextAreaValue(data2.data);

      // set metadata fields
      setMetadataFields([
        { key: 'author', value: data2.metadata.imageUrl },
        { key: 'title', value: 'Image' },
      ]);

      setLoading(false);

      // add(data2.description);
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

      {/* below is code from another app to upload an image. i need a btn here that allows for img upload and that the describe endpoint puts the text from it in the input box above. convert this to react and add it to the app 
      
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.click();

      // post image to server at /cf-images/upload
      // then take the url and post it to /cf-images/describe
      // then take the response and post it to /api/insert with title: 'Image' and author: cloudflare image url and data: response from /cf-images/describe
      fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        fetch(
          `https://commonbase-supabase-alpha.onrender.com/cf-images/upload`,
          {
            method: 'POST',
            headers: {
              Authorization: 'Bearer ' + apiKey,
            },
            body: formData,
          }
        )
          .then((response) => response.json())
          .then((data) => {
            // console.log('Image uploaded:', data);
            const pngUrl = data.url + '?format=png';
            // console.log('PNG URL:', pngUrl);
            fetch(
              `https://commonbase-supabase-alpha.onrender.com/cf-images/describe`,
              {
                method: 'POST',
                headers: {
                  Authorization: 'Bearer ' + apiKey,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageUrl: pngUrl }),
              }
            )
              .then((response) => response.json())
              .then((data) => {
                // console.log('Image description:', data);
                const metadata = {
                  title: 'Image',
                  author: data.metadata.imageUrl,
                };

                
                dialog
                  .querySelector('#insert')
                  .addEventListener('click', () => {
                    const editedText = dialog.querySelector('textarea').value;
                    fetch(`https://api-gateway-electron.onrender.com/add`, {
                      method: 'POST',
                      headers: {
                        Authorization: 'Bearer ' + apiKey,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        data: editedText,
                        metadata,
                        dbPath: '/var/data/db1.db',
                      }),
                    })
                      .then((response) => response.json())
      
      */}

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
    </div>
  );
};

export default Upload;
