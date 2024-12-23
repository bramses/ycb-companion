'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';

import LocaleSwitcher from '@/components/LocaleSwitcher';
import { LogOutButton } from '@/components/LogOutButton';
import SearchModalBeta from '@/components/SearchModalBeta';
import SpeedDial from '@/components/SpeedDial';
import Uploader from '@/components/Uploader';
import { fetchRandomEntry } from '@/helpers/functions';
import { BaseTemplate } from '@/templates/BaseTemplate';

export default function DashboardLayout(props: { children: React.ReactNode }) {
  const t = useTranslations('DashboardLayout');
  const router = useRouter();
  const [isSearchModalBetaOpen, setSearchModalBetaOpen] = useState(false);

  const [searchBetaModalQuery] = useState('');

  const [isFastEntryModalOpen, setFastEntryModalOpen] = useState(false);
  const openFastEntryModal = () => setFastEntryModalOpen(true);
  const closeFastEntryModal = () => setFastEntryModalOpen(false);

  const openSearchModalBeta = () => setSearchModalBetaOpen(true);
  const closeSearchModalBeta = () => setSearchModalBetaOpen(false);

  const onOpenModal = (which: string) => {
    if (which === 'upload') {
      openFastEntryModal();
    } else if (which === 'search') {
      openSearchModalBeta();
    }
  };

  const handleRandom = async () => {
    // fetch a random entry and open it
    const entry = await fetchRandomEntry();
    router.push(`/dashboard/entry/${entry.id}`);
  };

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.metaKey && event.key === 'u') {
        // cmd-u for Mac users
        openFastEntryModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // open search modal beta when user presses cmd+k using next/router
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        openSearchModalBeta();
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
          <li className="border-none text-gray-700 hover:text-gray-900">
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
          </li>
          <li>
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
            {/* <span> ({inboxCount.data.count})</span> */}
          </li>
          <li>
            <Link
              href="/dashboard/garden/"
              className="border-none text-gray-700 hover:text-gray-900"
            >
              {t('garden_link')}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/grid/"
              className="border-none text-gray-700 hover:text-gray-900"
            >
              {t('grid_link')}
            </Link>
          </li>
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
        contentLabel="Example Modal"
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
        <Uploader closeModal={closeFastEntryModal} />
      </Modal>
      <SpeedDial onOpenModal={onOpenModal} openRandom={handleRandom} />
      {props.children}
    </BaseTemplate>
  );
}

export const dynamic = 'force-dynamic';
