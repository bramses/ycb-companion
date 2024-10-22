/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/img-redundant-alt */

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const StarredEntries = () => {
  const [starredEntries, setStarredEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStarredEntriesHelper = async () => {
    // fetch starred entries from the database
    // render them in a list
    const starredEntriesResponse = await fetch('/api/starredEntries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const starredEntriesData = await starredEntriesResponse.json();
    setStarredEntries(starredEntriesData.data);
  };

  const renderResultData = (input: any) => {
    // metadata is a string parse it in place
    const result = input;
    if (result.metadata && typeof result.metadata === 'string') {
      try {
        result.metadata = JSON.parse(result.metadata);
      } catch (err) {
        console.error('Error parsing metadata:', err);
      }
    }

    if (
      result.metadata &&
      result.metadata.author &&
      result.metadata.author.includes('imagedelivery.net')
    ) {
      return <img src={result.metadata.author} alt="Image" />;
    }

    if (result.metadata && result.metadata.code) {
      return (
        <SyntaxHighlighter
          language={
            result.metadata.language === 'typescriptreact'
              ? 'tsx'
              : result.metadata.language
          }
          style={docco}
          wrapLines
          wrapLongLines
          customStyle={{ height: '200px', overflow: 'scroll' }}
        >
          {result.metadata.code}
        </SyntaxHighlighter>
      );
    }

    return result.data;
  };

  useEffect(() => {
    const fetchStarredEntries = async () => {
      try {
        setIsLoading(true);
        await fetchStarredEntriesHelper();
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching starred entries:', error);
      }
    };

    fetchStarredEntries();
  }, []);
  return (
    <div>
      <h1 className="my-4 text-4xl font-extrabold">Starred Entries</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        starredEntries.map((result) => (
          <div key={result.id}>
            <div
              key={result.id}
              className="mx-2 mb-4 flex items-center justify-between"
            >
              <div className="grow">
                <Link
                  href={{
                    pathname: `/dashboard/entry/${result.id}`,
                  }}
                  className="block text-gray-900 no-underline"
                >
                  <div className="relative">
                    <span className="font-normal">
                      {renderResultData(result)}
                    </span>
                  </div>
                </Link>
                <div className="text-sm text-gray-500">
                  Created: {new Date(result.createdAt).toLocaleString()}
                  {result.createdAt !== result.updatedAt && (
                    <>
                      {' '}
                      | Last Updated:{' '}
                      {new Date(result.updatedAt).toLocaleString()}{' '}
                    </>
                  )}
                </div>
              </div>
            </div>
            <hr className="my-4" />
          </div>
        ))
      )}
    </div>
  );
};

export default StarredEntries;
