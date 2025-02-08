'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import Modal from 'react-modal';

import LocaleSwitcher from '@/components/LocaleSwitcher';
import { LogOutButton } from '@/components/LogOutButton';
import SearchModalBeta from '@/components/SearchModalBeta';
import SpeedDial from '@/components/SpeedDial';
import Uploader from '@/components/Uploader';
import ShareUploader from '@/components/uploaders/share';
import { fetchRandomEntry } from '@/helpers/functions';
import { BaseTemplate } from '@/templates/BaseTemplate';

export default function DashboardLayout(props: { children: React.ReactNode }) {
  const t = useTranslations('DashboardLayout');
  const router = useRouter();
  const searchParams = useSearchParams();
  const shareParam = searchParams!.get('share') || '';
  const [isSearchModalBetaOpen, setSearchModalBetaOpen] = useState(false);

  const [searchBetaModalQuery] = useState('');

  const [isFastEntryModalOpen, setFastEntryModalOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const openFastEntryModal = () => setFastEntryModalOpen(true);
  const closeFastEntryModal = () => setFastEntryModalOpen(false);

  const openSearchModalBeta = () => setSearchModalBetaOpen(true);
  const closeSearchModalBeta = () => setSearchModalBetaOpen(false);

  const onOpenModal = (which: string) => {
    if (which === 'upload') {
      openFastEntryModal();
      const intervalId = setInterval(() => {
        const input = document.getElementById('modal-message');
        if (input) {
          setTimeout(() => {
            input.focus();
          }, 100);
          clearInterval(intervalId); // Stop the interval once the input is focused
        }
      }, 100);
    } else if (which === 'search') {
      openSearchModalBeta();
      const intervalId = setInterval(() => {
        const input = document.getElementById('modal-beta-search');
        if (input) {
          setTimeout(() => {
            input.focus();
          }, 100);
          clearInterval(intervalId); // Stop the interval once the input is focused
        }
      }, 100);
    }
  };

  // const handleRandom = async () => {
  //   // fetch a random entry and open it
  //   const entry = await fetchRandomEntry();
  //   router.push(`/dashboard/entry/${entry.id}`);
  // };

  const handleRandom = useCallback(async () => {
    const entry = await fetchRandomEntry();
    router.push(`/dashboard/entry/${entry.id}`);
  }, [router]);

  // open share if ?share is in url params
  useEffect(() => {
    if (shareParam) {
      setShowShareModal(true);
    }
  }, [shareParam]);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.metaKey && event.key === 'u') {
        // cmd-u for Mac users
        openFastEntryModal();
        const intervalId = setInterval(() => {
          const input = document.getElementById('modal-message');
          if (input) {
            setTimeout(() => {
              input.focus();
            }, 100);
            clearInterval(intervalId); // Stop the interval once the input is focused
          }
        }, 100);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // add event listener to 'r' key to open random page
  useEffect(() => {
    // const fetchRandomEntry = async () => {
    //   const response = await fetch('/api/random', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //   });
    //   const randdata = await response.json();
    //   return randdata.data[0];
    // };

    // const handleRandom = async () => {
    //   // fetch a random entry and open it
    //   const entry = await fetchRandomEntry();
    //   router.push(`/dashboard/entry/${entry.id}`);
    // };

    const handleKeyDown = (event: KeyboardEvent) => {
      // should be ignored if in input or textarea
      const target = event.target as HTMLElement;

      if (
        event.key === 'r' &&
        // meta key not pressed
        !event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !target.tagName.toLowerCase().includes('input') &&
        !target.tagName.toLowerCase().includes('textarea')
      ) {
        event.preventDefault();
        handleRandom();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleRandom]);

  // open search modal beta when user presses cmd+k using next/router
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        openSearchModalBeta();
        const intervalId = setInterval(() => {
          const input = document.getElementById('modal-beta-search');
          if (input) {
            setTimeout(() => {
              input.focus();
            }, 100);
            clearInterval(intervalId); // Stop the interval once the input is focused
          }
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // TODO: re-enable inbox count
  // const [inboxCount, setInboxCount] = useState<any>({
  //   data: {
  //     count: 0,
  //   },
  // });
  // const fetchInboxCountHelper = async () => {
  //   const inboxCountResponse = await fetch('/api/inboxCount', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //   });
  //   const inboxCountData = await inboxCountResponse.json();
  //   console.log('Inbox count:', inboxCountData);
  //   setInboxCount({
  //     data: {
  //       count: inboxCountData.data,
  //     },
  //   });
  // };

  // useEffect(() => {
  //   const fetchInboxCount = async () => {
  //     try {
  //       await fetchInboxCountHelper();
  //     } catch (error) {
  //       console.error('Error fetching inbox count:', error);
  //     }
  //   };

  //   fetchInboxCount();
  // }, []);

  return (
    <BaseTemplate
      leftNav={
        <>
          <li>
            <Link
              href="/dashboard/"
              className="border-none text-gray-700 hover:text-gray-900"
            >
              {t('dashboard_link')}
            </Link>
          </li>
          {/* <li className="border-none text-gray-700 hover:text-gray-900">
            <Link href="/dashboard/flow/" className="border-none">
              {t('flow_link')}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/starred-entries/"
              className="border-none text-gray-700 hover:text-gray-900"
            >
              {t('starred_entries_link')}
            </Link>
          </li> */}
          {/* <li>
            <Link
              href="/dashboard/flow-sessions/"
              className="border-none text-gray-700 hover:text-gray-900"
            >
              {t('flow_sessions_link')}
            </Link>
          </li>
          <li className="border-none text-gray-700 hover:text-gray-900">
            <Link href="/dashboard/inbox/" className="border-none">
              {t('inbox_link')}
            </Link>
            <span> ({inboxCount.data.count})</span>
          </li> */}
          <li>
            <Link
              href="/dashboard/garden/"
              className="border-none text-gray-700 hover:text-gray-900"
            >
              {t('garden_link')}
            </Link>
          </li>
          {/* <li>
            <Link
              href="/dashboard/grid/"
              className="border-none text-gray-700 hover:text-gray-900"
            >
              {t('grid_link')}
            </Link>
          </li> */}
          {/* <li>
            <Link
              href="/dashboard/user-profile/"
              className="border-none text-gray-700 hover:text-gray-900"
            >
              {t('user_profile_link')}
            </Link>
          </li> */}
        </>
      }
      rightNav={
        <>
          <li>
            <LogOutButton />
          </li>

          <li>
            <LocaleSwitcher />
          </li>
        </>
      }
    >
      <SearchModalBeta
        isOpen={isSearchModalBetaOpen || false}
        closeModalFn={closeSearchModalBeta}
        inputQuery={searchBetaModalQuery}
      />
      <Modal
        isOpen={isFastEntryModalOpen}
        onRequestClose={closeFastEntryModal}
        contentLabel="Fast Entry Modal"
        ariaHideApp={false}
        // apply custom styles using tailwind classes
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm
        -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-4 shadow-lg"
      >
        <button onClick={closeFastEntryModal} type="button">
          (close)
        </button>
        <h2
          className="mb-4 text-2xl font-semibold text-gray-800"
          id="modal-title"
        >
          Fast Entry
        </h2>
        <Uploader
          closeModal={closeFastEntryModal}
          textDefault=""
          titleDefault=""
          authorDefault="https://yourcommonbase.com/dashboard"
        />
      </Modal>
      {showShareModal && (
        <Modal
          isOpen={showShareModal}
          onRequestClose={() => setShowShareModal(false)}
          contentLabel="Share Modal"
          ariaHideApp={false}
          // apply custom styles using tailwind classes
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm
        -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-4 shadow-lg"
        >
          <button onClick={() => setShowShareModal(false)} type="button">
            (close)
          </button>
          <h2
            className="mb-4 text-2xl font-semibold text-gray-800"
            id="modal-title"
          >
            Share
          </h2>
          <ShareUploader
            closeModal={closeFastEntryModal}
            textDefault={shareParam}
            titleDefault=""
            authorDefault="https://yourcommonbase.com/dashboard"
          />
        </Modal>
      )}
      <SpeedDial onOpenModal={onOpenModal} openRandom={handleRandom} />
      {props.children}
    </BaseTemplate>
  );
}

export const dynamic = 'force-dynamic';
