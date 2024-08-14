/* eslint-disable no-console */

'use client';

import { useState } from 'react';

import Entries from './Entries';

const SearchBox = () => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [textAreaValue, setTextAreaValue] = useState('');

  const fetchByID = async (id: string) => {
    try {
      const response = await fetch('/api/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
        }),
      });
      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error fetching entry by ID:', error);
      return {};
    }
  };

  const fetchSearchResults = async (query: string) => {
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
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

      // for each entry, fetch the if metadata has a parent ID fetch the parent entry and its aliases and then fetch them
      /*
      ex: 
      {
  "title": "Your Commonbase Dashboard",
  "author": "",
  "_display": "right after chq talk kind of depressed was looking fwd to this and a bit empty now its over in terms of next goal. also afraid of medicine that i promised myself id start taking",
  "parent_id": 2575
}

  fetchByID(2575).then((parentEntry) => {
  "title": "Your Commonbase Dashboard",
  "author": "",
  "alias_ids": [
    2580
  ]
}).then((parentEntry) => {
  let aliasData = [];
  for (let i = 0; i < parentEntry.alias_ids.length; i++) {
    fetchByID(parentEntry.alias_ids[i]);
    aliasData.push(aliasData.data);
  }

  updatedMetadataWAliases = {
    ...parentEntry,
    aliasData: [...],
    selectedIndex: (index of the alias entry that was in the first step)
      */

      const updatedDataWithAliases = await Promise.all(
        updatedData.map(async (entry: any) => {
          if (entry.metadata.parent_id) {
            try {
              let selectedIndex = -1;

              // Fetch parent entry by parent_id
              const parentEntryRes = await fetchByID(entry.metadata.parent_id);
              const parentEntry = parentEntryRes.data;

              // Parse parent metadata
              const parentMetadataJSON = JSON.parse(parentEntry.metadata);
              parentEntry.metadata = parentMetadataJSON;

              // Find the index of the current entry in the parent's alias_ids
              if (
                parentMetadataJSON.alias_ids &&
                parentMetadataJSON.alias_ids.includes(Number(entry.id))
              ) {
                selectedIndex = parentMetadataJSON.alias_ids.indexOf(
                  Number(entry.id),
                );
              }

              // Fetch all alias entries by alias_ids
              const aliasData = await Promise.all(
                parentMetadataJSON.alias_ids.map(async (aliasId: string) => {
                  try {
                    const aliasEntryRes = await fetchByID(aliasId);
                    const aliasEntry = aliasEntryRes.data;
                    return aliasEntry.data;
                  } catch (aliasFetchError) {
                    console.error(
                      `Error fetching alias entry with ID ${aliasId}:`,
                      aliasFetchError,
                    );
                    throw aliasFetchError;
                  }
                }),
              );

              // Return the combined entry with parent and alias data
              return {
                ...parentEntry,
                aliasData,
                similarity: entry.similarity,
                selectedIndex,
              };
            } catch (parentFetchError) {
              console.error(
                `Error fetching parent entry with ID ${entry.metadata.parent_id}:`,
                parentFetchError,
              );
              throw parentFetchError;
            }
          }

          return entry;
        }),
      );

      console.log('Setting search results:', updatedDataWithAliases);
      setSearchResults(updatedDataWithAliases);
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
