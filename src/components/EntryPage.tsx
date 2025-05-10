/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-param-reassign */

// EntryPage.tsx

'use client';

import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

import { usePathname } from 'next/navigation';
// import Image from 'next/image';
import { useEffect, useState } from 'react';

import { fetchByID } from '@/helpers/functions';

// import Chat from './Chat';
// import LinksModal from './LinksModal';
import Thread from './Thread';

const EntryPage = () => {
  // fetch data from the server at id on load
  const [data, setData] = useState<{
    data: any;
    metadata: any;
    id: string;
    createdAt: string;
  } | null>(null);
  const pathname = usePathname();

  const [showAliasError] = useState(false);

  const [showDeleteError] = useState(false);

  useEffect(() => {
    if (data) {
      document.title = data.data;
    }
  }, [data]);

  useEffect(() => {
    if (!data) {
      const asyncFn = async () => {
        // get id from pathname by popping the last element
        const id = pathname.split('/').pop();
        if (!id) return;
        const entryId = Array.isArray(id) ? id[0] : id; // Handle both string and string[]
        if (!entryId) return;
        let res;

        try {
          res = await fetchByID(entryId);
        } catch (error: any) {
          if (error.message.includes('No data returned from the API')) {
            // remove current page from the history stack so user doesnt back to it for loop
            window.history.pushState({}, '', window.location.pathname);
            // Redirect to a 404 page
            window.location.href = '/dashboard'; // todo a react toast instead
          }
          // Handle other errors
          console.error(error);
          console.error('An error occurred in fetching entry:', error);
          throw error;
        }

        setData({
          data: res.data,
          metadata: res.metadata,
          id: res.id,
          createdAt: res.createdAt,
        });
      };
      asyncFn();
    }
  }, [pathname, data]);

  const handleDeleteEntryV2 = async () => {
    if (!data) return;
    // Check if there are alias IDs
    if (data.metadata.alias_ids && data.metadata.alias_ids.length > 0) {
      alert('Please delete all comments before deleting the entry.');
      return;
    }

    // Confirm deletion
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this entry?',
    );
    if (!confirmDelete) return;

    try {
      // Attempt to delete the entry via API
      const response = await fetch(`/api/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: data.id }),
      });

      if (response.ok) {
        // Redirect to homepage on successful deletion
        window.location.href = '/dashboard';
      } else {
        throw new Error('Failed to delete entry');
      }
    } catch (error) {
      alert('Failed to delete entry. Please try again.');
      console.error('Error deleting entry:', error);
    }
  };

  return (
    <div className="">
      {showAliasError && (
        <div className="text-red-500">Error adding comment. Try again.</div>
      )}
      <hr className="my-8 h-px w-full border-0 bg-gray-200 dark:bg-gray-700" />
      <button
        type="button"
        onClick={handleDeleteEntryV2}
        className="my-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4"
      >
        Delete Entry
      </button>
      {showDeleteError && (
        <div className="text-red-500">
          Error deleting entry, delete comments first if you want to delete the
          entry.
        </div>
      )}
      {data ? (
        <div>
          <Thread inputId={data.id} />
        </div>
      ) : null}
    </div>
  );
};

export default EntryPage;
