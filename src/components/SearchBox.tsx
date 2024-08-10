'use client';

import { useState } from 'react';

import Entries from './Entries';

const SearchBox = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [textAreaValue, setTextAreaValue] = useState('');

  const fetchSearchResults = async (query: string) => {
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          dbPath:
            // '/Users/bram/Dropbox/PARA/Projects/api-gateway-local-build/api-gateway-electron/yourcommonbase.db',
            '/var/data/db1.db',
        }),
      });
      console.log('response:', response);
      const data = await response.json();
      console.log('Fetched search results:', data);

      // convert each metadata string to an object
      const updatedData = data.data.map((entry: any) => {
        try {
          return { ...entry, metadata: JSON.parse(entry.metadata) };
        } catch (err) {
          console.error('Error parsing metadata:', err);
          return entry;
        }
      });

      setSearchResults(updatedData);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const handleDataFromEntry = (data: string) => {
    setTextAreaValue(data);
    fetchSearchResults(data);
  };

  return (
    <div>
      <textarea
        id="message"
        rows={4}
        className="mt-4 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        placeholder="Your message..."
        value={textAreaValue}
        onChange={(e) => setTextAreaValue(e.target.value)}
      />

      <button
        type="button"
        onClick={() => fetchSearchResults(textAreaValue)}
        className="mb-2 me-2 mt-4 w-full rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Search
      </button>
      <Entries searchResults={searchResults} onDelve={handleDataFromEntry} />
    </div>
  );
};

export default SearchBox;
