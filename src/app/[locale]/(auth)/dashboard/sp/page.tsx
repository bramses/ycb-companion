'use client';

import { useState } from 'react';

export default function StarterPackUploader() {
  const [starterPacks] = useState<any[]>([
    {
      path: 'test.ts',
      name: 'test',
      description: 'test starter pack',
    },
    {
      path: 'simple-story.ts',
      name: 'simple story',
      description: 'once upon a time',
    },
    {
      path: 'images.ts',
      name: 'image test',
      description: 'image starter pack',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [entryBeingAdded, setEntryBeingAdded] = useState<any>(null);
  const apiKey = process.env.NEXT_PUBLIC_API_KEY_CF_IMG;

  function base64ToArrayBuffer(base64: string): ArrayBuffer {
    // TODO not needed for img v2
    // Remove the data URI prefix
    const base64String = base64.split(',')[1];

    // Decode the Base64 string to a binary string
    const binaryString = atob(base64String!);

    // Create an ArrayBuffer and a view to manipulate it
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i += 1) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;
  }

  const uploadImageFromDataURI = async (dataURI: string) => {
    // Create a new Worker to process the image
    const worker = new Worker('/imageWorker.js');
    worker.postMessage({ file: base64ToArrayBuffer(dataURI), apiKey });

    worker.onmessage = async (e) => {
      const { success, data, error } = e.data;
      if (success) {
        console.log('Image description:', data);

        const response = await fetch('/api/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: data.data,
            metadata: {
              title: 'Image',
              author: data.metadata.imageUrl,
            },
          }),
        });
        console.log('responseEntry:', response);
      } else {
        console.error('Error:', error);
      }
    };
  };

  // a btn for each starter pack that when clicked, adds all entries from starter pack
  const handleAddStarterPack = async (starterPackPath: string) => {
    setIsLoading(true);
    const starterPack = await import(`@/starter-packs/${starterPackPath}`);
    const { entries } = starterPack.default;
    // add all entries from starter pack
    await Promise.all(
      entries.map(async (entry: any) => {
        if (entry.image) {
          setEntryBeingAdded({
            data: entry.alt,
          });
          // Handle image upload
          await uploadImageFromDataURI(entry.image);
        } else {
          setEntryBeingAdded(entry);

          // Handle data upload
          const response = await fetch('/api/add', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              data: entry.data,
              metadata: entry.metadata,
            }),
          });
          const responseData = await response.json();
          console.log('responseData:', responseData);
        }
      }),
    );
    setIsLoading(false);
    setEntryBeingAdded(null);
  };

  return (
    <div>
      <h1>Starter Packs</h1>
      <p>Upload your own starter packs to get started quickly.</p>
      <div>
        {starterPacks.map((starterPack) => (
          <button
            key={starterPack}
            onClick={() => handleAddStarterPack(starterPack.path)}
            type="button"
            className="my-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4"
          >
            Add Starter Pack {starterPack.name} ({starterPack.description})
          </button>
        ))}
        {entryBeingAdded && (
          <div className="my-2 text-sm text-gray-500">
            Adding entry: {entryBeingAdded.data} (
            {entryBeingAdded.metadata.title})
          </div>
        )}
      </div>
      {isLoading && <div>Loading...</div>}
    </div>
  );
}
