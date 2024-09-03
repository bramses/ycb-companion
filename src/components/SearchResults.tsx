'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchSearchEntries } from '../helpers/functions';

const SearchResults = () => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [textAreaValue, setTextAreaValue] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [rndmBtnText, setRndmBtnText] = useState('Random');

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

  const handleSearch = async () => {
    router.push(`${pathname}?${createQueryString('query', textAreaValue)}`);

    setShowLoading(true);

    const parsedEntries = await fetchSearchEntries(
      textAreaValue,
      setSearchResults,
    );

    setSearchResults(parsedEntries);

    setShowLoading(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        if (textAreaRef.current) {
          e.preventDefault();
          textAreaRef.current.focus();
          // highlight the text in the textarea
          textAreaRef.current.select();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // if routed to with no params focus the textarea
  useEffect(() => {
    if (searchParams.toString() === '') {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
      }
    }
  }, [searchParams]);

  return (
    <div className="min-w-full">
      <textarea
        ref={textAreaRef}
        id="message"
        rows={2}
        style={{ fontSize: '17px' }}
        className="sticky top-2 z-50 mt-4 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
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
      <div className="mt-4 flex space-x-2">
        {/* a btn to take the text in textarea and search google with it in a new tab */}
        <button
          type="button"
          onClick={() => {
            window.open(
              `https://www.google.com/search?q=${textAreaValue}`,
              '_blank',
            );
          }}
          className="mb-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-gray-300"
        >
          Search the Web
        </button>

        {/* a btn to call /api/random and put the text in the textarea */}
        <button
          type="button"
          onClick={async () => {
            setRndmBtnText('Loading...');
            const response = await fetch('/api/random', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            const data = await response.json();
            // console.log('Random data:', data);
            setTextAreaValue(data.data.data);
            setRndmBtnText('Random');
          }}
          className="mb-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-gray-300"
        >
          {rndmBtnText}
        </button>
      </div>
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
          {/* when was the entry created and updated */}
          <div className="text-sm text-gray-500">
            Created: {new Date(result.createdAt).toLocaleString()}
            {result.createdAt !== result.updatedAt && (
              <>
                {' '}
                | Last Updated: {new Date(
                  result.updatedAt,
                ).toLocaleString()}{' '}
              </>
            )}
          </div>
          <a
            target="_blank"
            href={result.metadata.author}
            rel="noopener noreferrer"
            className="inline-flex items-center font-medium text-blue-600 hover:underline"
          >
            {new URL(result.metadata.author).hostname}
            <svg
              className="ms-2.5 size-3 rtl:rotate-[270deg]"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 18 18"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778"
              />
            </svg>
          </a>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;
