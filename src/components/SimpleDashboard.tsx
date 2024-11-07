'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { fetchByID, fetchRandomEntry } from '@/helpers/functions';

import ForceFromEntry from './ForceFromEntry';
import SearchModalBeta from './SearchModalBeta';

const SimpleDashboard = () => {
  const router = useRouter();

  const [randomEntry, setRandomEntry] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);

  const [firstLastName, setFirstLastName] = useState({
    firstName: '',
    lastName: '',
  });
  const [isSearchModalBetaOpen, setSearchModalBetaOpen] = useState(false);
  const [searchBetaModalQuery, setSearchBetaModalQuery] = useState('');

  // const [inboxEntries, setInboxEntries] = useState<any[]>([]);
  const { user, isLoaded } = useUser();

  const handleRandom = async () => {
    setRandomEntry(null);
    setComments([]);
    // fetch a random entry and open it
    const entry = await fetchRandomEntry();
    // const entry = await fetchByID('9548');
    // if entry has a parent_id, fetch the parent entry
    let { metadata } = entry;
    try {
      metadata = JSON.parse(entry.metadata);
    } catch (err) {
      console.error('Error parsing metadata:', err);
    }
    if (metadata.alias_ids) {
      console.log('metadata.alias_ids:', metadata.alias_ids);
      const commentsList = [];
      const aliasEntries = await Promise.all(
        metadata.alias_ids.map(async (aliasId: string) => {
          const aliasEntry = await fetchByID(aliasId);
          return aliasEntry;
        }),
      );
      for (const aliasEntry of aliasEntries) {
        commentsList.push({
          aliasId: aliasEntry.id,
          aliasData: aliasEntry.data,
          aliasMetadata: aliasEntry.metadata,
        });
      }
      setComments(commentsList);
    }
    if (metadata.parent_id) {
      const parentEntry = await fetchByID(metadata.parent_id);
      // make sure metadata is JSON parseable
      try {
        parentEntry.metadata = JSON.parse(parentEntry.metadata);
      } catch (err) {
        // pass
      }
      setRandomEntry(parentEntry);
      return parentEntry;
    }
    try {
      entry.metadata = JSON.parse(entry.metadata);
    } catch (err) {
      // pass
    }
    setRandomEntry(entry);
    return entry;
  };

  // const fetchInboxEntries = async () => {
  //   try {
  //     setIsLoading(true);
  //     const response = await fetch('/api/inbox', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         page: 1,
  //       }),
  //     });
  //     const data = await response.json();
  //     setInboxEntries(data.data);
  //     setIsLoading(false);
  //   } catch (error) {
  //     console.error('Error fetching inbox entries:', error);
  //   }
  // };

  // useEffect(() => {
  //   fetchInboxEntries();
  // }, []);

  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.get('query');
    if (query) {
      // open search modal beta with query
      setSearchModalBetaOpen(true);
      setSearchBetaModalQuery(query);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isLoaded) return;
    // set first name as title
    if (user?.firstName && user?.lastName) {
      setFirstLastName({
        firstName: user.firstName,
        lastName: user.lastName,
      });
    }
  }, [isLoaded, user]);

  useEffect(() => {
    const fetchEntry = async () => {
      // fetch random entry
      await handleRandom();
    };
    fetchEntry();
  }, []);

  const closeModal = () => setSearchModalBetaOpen(false);

  return (
    <div>
      <h1 className="mx-2 mt-8 text-xl font-extrabold text-gray-900 md:text-xl lg:text-xl">
        Welcome Back to{' '}
        <span className="bg-gradient-to-r from-sky-400 to-emerald-600 bg-clip-text text-transparent">
          Your Commonbase
        </span>
        , {firstLastName.firstName}!
      </h1>
      <div className="mx-2 my-4">
        <p className="mb-4">{randomEntry ? randomEntry.data : 'Loading...'}</p>
        {randomEntry && randomEntry.metadata.author && (
          <>
            <a
              target="_blank"
              href={randomEntry.metadata.author}
              rel="noopener noreferrer"
              className="inline-flex items-center font-medium text-blue-600 hover:underline"
            >
              {randomEntry.metadata.title}
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
            <button
              type="button"
              className="ms-2 inline-flex items-center rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4"
              onClick={() => {
                setSearchModalBetaOpen(true);
                setSearchBetaModalQuery(
                  `"metadata:${randomEntry.metadata.title}"`,
                );
              }}
            >
              Search Metadata
            </button>
          </>
        )}
      </div>
      <ForceFromEntry inputEntry={randomEntry} inputComments={comments} />
      <SearchModalBeta
        isOpen={isSearchModalBetaOpen || false}
        closeModalFn={() => closeModal()}
        inputQuery={searchBetaModalQuery}
      />

      {randomEntry && (
        <>
          <button
            onClick={() => {
              const { id } = randomEntry;
              router.push(`/dashboard/entry/${id}`);
            }}
            type="button"
            className="my-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4"
          >
            Open Entry
          </button>
          <button
            onClick={handleRandom}
            type="button"
            className="my-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4"
          >
            Next Entry
          </button>
        </>
      )}
    </div>
  );
};

export default SimpleDashboard;
