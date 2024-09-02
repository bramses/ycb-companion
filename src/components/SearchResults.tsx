'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const SearchResults = () => {
  const [textAreaValue, setTextAreaValue] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  useEffect(() => {
    const query = searchParams.get('query');
    if (query) {
      setTextAreaValue(query);
    }
  }, [searchParams]);

  async function fetchFavicon(url: string) {
    const response = await fetch(`/api/favicon?url=${url}`);
    const data = await response.json();
    return data;
  }

  const fetchByID = async (entryId: string) => {
    const response = await fetch('/api/fetch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: entryId,
      }),
    });

    const resData = await response.json();

    const entry = resData.data;
    // parse metadata
    const metadata = JSON.parse(entry.metadata);

    return {
      data: entry.data,
      metadata,
    };
  };

  async function fetchSearchEntries() {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: textAreaValue }),
    });
    const data = await response.json();
    const entries = data.data;
    // map entries.metadata to json
    const parsedEntries = entries.map((entry: any) => {
      let metadata;
      try {
        metadata = JSON.parse(entry.metadata);
      } catch (err) {
        metadata = entry.metadata; // fallback to original metadata if parsing fails
      }

      return { ...entry, metadata, favicon: '/favicon.ico' };
    });

    // Return parsed entries immediately
    setSearchResults(parsedEntries);

    // for all entries with a parent_id, fetch parent_id data and append data as parentData key
    const parentPromises = parsedEntries.map((entry: any) => {
      if ('parent_id' in entry.metadata) {
        return fetchByID(entry.metadata.parent_id);
      }
      return Promise.resolve(null); // Return null for entries without parent_id
    });

    Promise.allSettled(parentPromises).then((results) => {
      const updatedEntries = parsedEntries.map((entry: any, index: any) => {
        if (!results[index]) {
          return entry;
        }
        if (results[index].status === 'fulfilled' && results[index].value) {
          return { ...entry, parentData: results[index].value };
        }
        return entry;
      });

      console.log('updatedEntries:', updatedEntries);

      // Return updated entries immediately
      setSearchResults(updatedEntries);

      // fetch favicon for each entry
      const faviconPromises = updatedEntries.map((entry: any) => {
        if (!entry.metadata) {
          return { favicon: '/favicon.ico' };
        }

        return fetchFavicon(entry.metadata.author);
      });

      Promise.all(faviconPromises).then((favicons) => {
        const updatedEntriesFavicon = updatedEntries.map(
          (entry: any, index: any) => {
            const favicon = favicons[index].favicon
              ? favicons[index].favicon
              : '/favicon.ico';
            return { ...entry, favicon };
          },
        );

        // Update search results with favicons
        setSearchResults(updatedEntriesFavicon);
      });
    });

    return parsedEntries;
  }

  const handleSearch = async () => {
    router.push(`${pathname}?${createQueryString('query', textAreaValue)}`);

    setShowLoading(true);

    const parsedEntries = await fetchSearchEntries();

    setSearchResults(parsedEntries);

    setShowLoading(false);
  };

  return (
    <div>
      <textarea
        id="message"
        rows={2}
        className="sticky top-2 z-50 mt-4 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        placeholder="Your query... (Press Enter to search) (Press cmd-k to focus) (Press cmd + u anywhere on website to fast upload)"
        value={textAreaValue}
        onChange={(e) => setTextAreaValue(e.target.value)}
        onFocus={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch();
          }
        }}
      />

      <button
        type="button"
        onClick={() => handleSearch()}
        className="mb-2 me-2 mt-4 w-full rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        Search
      </button>
      {showLoading && <div>Loading...</div>}
      {searchResults.map((result) => (
        <div key={result.id} className="mb-4">
          <Link
            href={{
              pathname: `/dashboard/entry/${result.id}`,
            }}
            className="block"
          >
            <div className="flex items-center text-blue-600 hover:underline">
              <Image
                src={result.favicon}
                alt="favicon"
                width={16}
                height={16}
                className="mr-2"
              />
              <span className="font-medium">
                {result.data.length > 50 ? (
                  <>
                    {result.data.slice(0, 50)}...
                    <span className="mt-1 block text-sm text-gray-500">
                      ...{result.data.slice(50)}
                    </span>
                  </>
                ) : (
                  result.data
                )}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {result.parentData && (
                <span className="mt-1 block">{result.parentData.data}</span>
              )}
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;
