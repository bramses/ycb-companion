'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import Loading from '@/components/Loading';

const Inbox = () => {
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);

  const fetchInboxEntries = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/inbox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page,
        }),
      });
      const data = await response.json();
      console.log('Inbox entries:', data);
      setEntries(data.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching inbox entries:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchInboxEntries();
  };

  useEffect(() => {
    fetchInboxEntries();
  }, [page]);

  useEffect(() => {
    document.title = 'Inbox';
  }, []);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        entries.map((entry: any) => (
          <div key={entry.id}>
            <div
              key={entry.id}
              className="mx-2 mb-4 flex items-center justify-between"
            >
              <div className="grow">
                <Link
                  href={{
                    pathname: `/dashboard/entry/${entry.id}`,
                  }}
                  className="block text-gray-900 no-underline"
                >
                  <div className="relative">
                    <span className="font-normal">{entry.data}</span>
                  </div>
                </Link>
                <div className="text-sm text-gray-500">
                  Created: {new Date(entry.createdAt).toLocaleString()}
                  {entry.createdAt !== entry.updatedAt && (
                    <>
                      {' '}
                      | Last Updated:{' '}
                      {new Date(entry.updatedAt).toLocaleString()}{' '}
                    </>
                  )}
                </div>
              </div>
            </div>
            <hr className="my-4" />
          </div>
        ))
      )}
      {!isLoading && (
        <button
          type="button"
          onClick={() => handlePageChange(page + 1)}
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white"
        >
          Load More
        </button>
      )}
    </>
  );
};

export default Inbox;
