'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { fetchByID, fetchRandomEntry } from '@/helpers/functions';

import ForceFromEntry from './ForceFromEntry';
import SearchModalBeta from './SearchModalBeta';

const SimpleDashboard = () => {
  const [randomEntry, setRandomEntry] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);

  const [firstLastName, setFirstLastName] = useState({
    firstName: '',
    lastName: '',
  });
  const [isSearchModalBetaOpen, setSearchModalBetaOpen] = useState(false);
  const [searchBetaModalQuery, setSearchBetaModalQuery] = useState('');
  const [logEntries, setLogEntries] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [timeMachine, setTimeMachine] = useState<any>('week');
  const [randomTimeMachineEntry, setRandomTimeMachineEntry] =
    useState<any>(null);
  const [timeMachineEntries, setTimeMachineEntries] = useState<any[]>([]);

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

      if (parentEntry.metadata.alias_ids) {
        const commentsList = [];
        const aliasEntries = await Promise.all(
          parentEntry.metadata.alias_ids.map(async (aliasId: string) => {
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

  // for time machine, fetch entries from the past week, month, or year depending on the timeMachine state and select a random entry from the fetched entries
  /*

  const fetchRecords = useCallback(
    async (date: Date) => {
      // convert date to form 2024-01-01
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      let monthString = month.toString();
      // put a 0 in front of month if it is less than 10
      if (month < 10) {
        monthString = `0${month}`;
      }
      const day = date.getDate();
      let dayString = day.toString();
      if (day < 10) {
        dayString = `0${day}`;
      }
      const dateString = `${year}-${monthString}-${dayString}`;
      setSelectedDay(dateString);
      setLoading(true);

      // run a post request to fetch records for that date at /api/daily
      const response = await fetch('/api/daily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: dateString }),
      });
      const responseData = await response.json();

      // console.log('Fetched records:', responseData);
      // set entries to the mapped data
      setEntries(responseData.data);
      setDateSelected(date);
      setLoading(false);
    },
    [setSelectedDay, setLoading, setEntries],
  );
  */
  const fetchTimeMachineEntries = async () => {
    try {
      const date = new Date();
      switch (timeMachine) {
        case 'week':
          date.setDate(date.getDate() - 7);
          break;
        case 'month':
          date.setMonth(date.getMonth() - 1);
          break;
        case 'year':
          date.setFullYear(date.getFullYear() - 1);
          break;
        default:
          break;
      }
      // use daily endpoint to fetch entries from the past week, month, or year

      // convert date to form 2024-01-01
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      let monthString = month.toString();
      // put a 0 in front of month if it is less than 10
      if (month < 10) {
        monthString = `0${month}`;
      }
      const day = date.getDate();
      let dayString = day.toString();
      if (day < 10) {
        dayString = `0${day}`;
      }
      const dateString = `${year}-${monthString}-${dayString}`;

      const response = await fetch('/api/daily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: dateString }),
      });
      const responseData = await response.json();
      setTimeMachineEntries(responseData.data);
      // math random number between 0 and the length of the responseData.data array
      const randomIndex = Math.floor(Math.random() * responseData.data.length);
      setRandomTimeMachineEntry(responseData.data[randomIndex]);
    } catch (error) {
      console.error('Error fetching time machine entries:', error);
    }
  };

  useEffect(() => {
    fetchTimeMachineEntries();
  }, [timeMachine]);

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

  // get log entries
  const fetchLogEntries = async () => {
    try {
      const response = await fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: 1,
          limit: 10,
          sortModel: [{ colId: 'createdAt', sort: 'desc' }],
        }),
      });
      const data = await response.json();
      // if createdAt == updatedAt, say "added", else "updated"
      const log = data.data
        .map((entry: any) => {
          // skip entries with parent_id
          let metadata;
          try {
            metadata = JSON.parse(entry.metadata);
          } catch (err) {
            console.error('Error parsing metadata:', err);
          }
          if (metadata.parent_id) {
            return null;
          }
          if (entry.createdAt === entry.updatedAt) {
            return {
              ...entry,
              action: 'added',
            };
          }
          return {
            ...entry,
            action: 'updated',
          };
        })
        .filter((entry: any) => entry !== null);
      console.log('Log:', log);
      setLogEntries(log);
    } catch (error) {
      console.error('Error fetching log entries:', error);
    }
  };

  useEffect(() => {
    fetchLogEntries();
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
        <Link
          href={`/dashboard/entry/${randomEntry ? randomEntry.id : '#'}`}
          className="mb-4 inline-block"
        >
          {randomEntry ? randomEntry.data : 'Loading...'}
        </Link>
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
          {/* <button
            onClick={() => {
              const { id } = randomEntry;
              router.push(`/dashboard/entry/${id}`);
            }}
            type="button"
            className="my-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4"
          >
            Open Entry
          </button> */}
          <button
            onClick={handleRandom}
            type="button"
            className="my-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4"
          >
            Next Entry
          </button>
        </>
      )}

      <div>
        <h1 className="my-4 text-xl font-extrabold text-gray-900 md:text-xl lg:text-xl">
          Last {timeMachine}, you were thinking about:
        </h1>
        <div className="mx-2 my-4">
          <select
            value={timeMachine}
            onChange={(e) => setTimeMachine(e.target.value)}
            className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>
        {/* {
    "id": "14586",
    "data": "This is a crucial, often missed, point about the transition from foraging to farming. The change wasn’t merely a pivotal point in how our species lived in the world. It marked a fundamental shift in what kind of world human beings inhabited, both materially and conceptually. It isn’t hyperbole to say that agriculture extracted humans from the world and pitted us against it. Niles Eldredge of the American Museum of Natural History has written that the shift to agriculture and resulting civilization removed our species from the relation with the natural world that we had until then shared with every other species since life began. “We abruptly stepped out of the local ecosystem.… Our interests no longer dovetail[ed] with those of the natural world around us.…” Adopting agriculture was “tantamount to declaring war on local ecosystems.”",
    "metadata": "{\"author\":\"https://readwise.io/open/626412500\",\"title\":\"Civilized to Death - Christopher Ryan\",\"readwise_id\":626412500}",
    "createdAt": "2023-11-14T19:38:04.037Z",
    "updatedAt": "2024-10-18T00:47:41.990Z"
} */}

        {randomTimeMachineEntry && (
          <Link
            href={{
              pathname: `/dashboard/entry/${randomTimeMachineEntry.id}`,
            }}
            className="block text-gray-900 no-underline"
          >
            <div className="relative">
              <span className="font-normal">{randomTimeMachineEntry.data}</span>
            </div>
            <div className="text-sm text-gray-500">
              Created:{' '}
              {new Date(randomTimeMachineEntry.createdAt).toLocaleDateString()}
              {randomTimeMachineEntry.createdAt !==
                randomTimeMachineEntry.updatedAt && (
                <>
                  {' '}
                  | Last Updated:{' '}
                  {new Date(
                    randomTimeMachineEntry.updatedAt,
                  ).toLocaleDateString()}{' '}
                </>
              )}
            </div>
          </Link>
        )}
        {/* if timeMachineEntries is > 1 length, a btn fetches a new random entry from the timeMachineEntries array */}
        {timeMachineEntries.length > 1 && (
          <button
            onClick={() => {
              const randomIndex = Math.floor(
                Math.random() * timeMachineEntries.length,
              );
              setRandomTimeMachineEntry(timeMachineEntries[randomIndex]);
            }}
            type="button"
            className="my-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-gray-300"
          >
            Next Entry
          </button>
        )}
      </div>
      {/* ask the user what they are thinking about right now in a text box and add it as an entry -- like a journal */}
      <h1 className="my-4 text-xl font-extrabold text-gray-900 md:text-xl lg:text-xl">
        Journal
      </h1>
      <div className="mx-2 my-4">
        <textarea
          id="journal-message"
          rows={4}
          className="mt-4 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          style={{ fontSize: '17px' }}
          placeholder="What are you thinking about right now?"
        />
        <button
          type="button"
          onClick={async () => {
            const journalMessage = (
              document.getElementById('journal-message') as HTMLInputElement
            ).value;
            if (!journalMessage) {
              return;
            }
            setIsSaving(true); // Set loading state
            try {
              // add the journal message as an entry
              await fetch('/api/add', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  data: journalMessage,
                  metadata: {
                    author: 'https://ycb-companion.onrender.com/dashboard',
                    title: 'Journal',
                  },
                }),
              });
              (
                document.getElementById('journal-message') as HTMLInputElement
              ).value = ''; // Clear textarea
              await fetchLogEntries(); // Reload log entries
            } catch (error) {
              console.error('Error saving journal entry:', error);
            } finally {
              setIsSaving(false); // Reset loading state
            }
          }}
          disabled={isSaving} // Disable button while saving
          className={`mt-2 w-full rounded-lg ${
            isSaving ? 'bg-gray-400' : 'bg-blue-700'
          } px-5 py-2.5 text-sm font-medium text-white ${
            isSaving ? '' : 'hover:bg-blue-800'
          } focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800`}
        >
          {isSaving ? 'Loading...' : 'Save'}
        </button>
      </div>

      <h1 className="my-4 text-xl font-extrabold text-gray-900 md:text-xl lg:text-xl">
        Recent Activity
      </h1>
      <div className="mx-2 my-4">
        {logEntries.map((entry: any) => (
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
                  {(() => {
                    if (entry.action === 'added') {
                      return <b>Added</b>;
                    }
                    if (entry.action === 'updated') {
                      return <b>Updated</b>;
                    }
                    return 'Deleted';
                  })()}{' '}
                  {new Date(entry.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            {/* <hr className="my-4" /> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleDashboard;
