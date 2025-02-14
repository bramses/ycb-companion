'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import AnimatedNumbers from 'react-animated-numbers';

import { fetchFavicon, fetchRandomEntry } from '@/helpers/functions';

// import ForceFromEntry from "./ForceFromEntry";
import HelpModal from './HelpModal';
import SearchModalBeta from './SearchModalBeta';
// import Uploader from "./Uploader";
import UploaderModalWrapper from './UploaderModalWrapper';

const SimpleDashboard = () => {
  const router = useRouter();
  // const [randomEntry, setRandomEntry] = useState<any>(null);
  // const [comments, setComments] = useState<any[]>([]);
  const [isSearchModalBetaOpen, setSearchModalBetaOpen] = useState(false);
  const [searchBetaModalQuery, setSearchBetaModalQuery] = useState('');
  const [logEntries, setLogEntries] = useState<any[]>([]);
  // const [isSaving, setIsSaving] = useState(false);
  // const [timeMachine, setTimeMachine] = useState<any>('week');
  // const [randomTimeMachineEntry, setRandomTimeMachineEntry] =
  //   useState<any>(null);
  // const [timeMachineEntries, setTimeMachineEntries] = useState<any[]>([]);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [instructions, setInstructions] = useState<any[]>([]);
  const [buttons, setButtons] = useState<any[]>([]);
  const [isUploaderModalOpen, setUploaderModalOpen] = useState(false);
  const [totalEntries, setTotalEntries] = useState(-1);
  const [todaysEntriesLength, setTodaysEntriesLength] = useState(0);
  const [uploaderModalType, setUploaderModalType] = useState('');

  // const [inboxEntries, setInboxEntries] = useState<any[]>([]);

  // const handleRandom = async () => {
  //   setRandomEntry(null);
  //   setComments([]);
  //   // fetch a random entry and open it
  //   const entry = await fetchRandomEntry();
  //   // const entry = await fetchByID('9548');
  //   // if entry has a parent_id, fetch the parent entry
  //   let { metadata } = entry;
  //   try {
  //     metadata = JSON.parse(entry.metadata);
  //   } catch (err) {
  //     console.error('Error parsing metadata:', err);
  //   }
  //   if (metadata.alias_ids) {
  //     const commentsList = [];
  //     const aliasEntries = await Promise.all(
  //       metadata.alias_ids.map(async (aliasId: string) => {
  //         const aliasEntry = await fetchByID(aliasId);
  //         return aliasEntry;
  //       }),
  //     );
  //     for (const aliasEntry of aliasEntries) {
  //       commentsList.push({
  //         aliasId: aliasEntry.id,
  //         aliasData: aliasEntry.data,
  //         aliasMetadata: aliasEntry.metadata,
  //       });
  //     }
  //     setComments(commentsList);
  //   }
  //   if (metadata.parent_id) {
  //     const parentEntry = await fetchByID(metadata.parent_id);
  //     // make sure metadata is JSON parseable
  //     try {
  //       parentEntry.metadata = JSON.parse(parentEntry.metadata);
  //     } catch (err) {
  //       // pass
  //     }

  //     if (parentEntry.metadata.alias_ids) {
  //       const commentsList = [];
  //       const aliasEntries = await Promise.all(
  //         parentEntry.metadata.alias_ids.map(async (aliasId: string) => {
  //           const aliasEntry = await fetchByID(aliasId);
  //           return aliasEntry;
  //         }),
  //       );
  //       for (const aliasEntry of aliasEntries) {
  //         commentsList.push({
  //           aliasId: aliasEntry.id,
  //           aliasData: aliasEntry.data,
  //           aliasMetadata: aliasEntry.metadata,
  //         });
  //       }
  //       setComments(commentsList);
  //     }

  //     setRandomEntry(parentEntry);
  //     return parentEntry;
  //   }
  //   try {
  //     entry.metadata = JSON.parse(entry.metadata);
  //   } catch (err) {
  //     // pass
  //   }
  //   setRandomEntry(entry);
  //   return entry;
  // };

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
  // const fetchTimeMachineEntries = async () => {
  //   try {
  //     const date = new Date();
  //     switch (timeMachine) {
  //       case 'week':
  //         date.setDate(date.getDate() - 7);
  //         break;
  //       case 'month':
  //         date.setMonth(date.getMonth() - 1);
  //         break;
  //       case 'year':
  //         date.setFullYear(date.getFullYear() - 1);
  //         break;
  //       default:
  //         break;
  //     }
  //     // use daily endpoint to fetch entries from the past week, month, or year

  //     // convert date to form 2024-01-01
  //     const year = date.getFullYear();
  //     const month = date.getMonth() + 1;
  //     let monthString = month.toString();
  //     // put a 0 in front of month if it is less than 10
  //     if (month < 10) {
  //       monthString = `0${month}`;
  //     }
  //     const day = date.getDate();
  //     let dayString = day.toString();
  //     if (day < 10) {
  //       dayString = `0${day}`;
  //     }
  //     const dateString = `${year}-${monthString}-${dayString}`;

  //     const response = await fetch('/api/daily', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ date: dateString }),
  //     });
  //     const responseData = await response.json();
  //     setTimeMachineEntries(responseData.data);
  //     // math random number between 0 and the length of the responseData.data array
  //     const randomIndex = Math.floor(Math.random() * responseData.data.length);
  //     setRandomTimeMachineEntry(responseData.data[randomIndex]);
  //   } catch (error) {
  //     console.error('Error fetching time machine entries:', error);
  //   }
  // };

  // useEffect(() => {
  //   fetchTimeMachineEntries();
  // }, [timeMachine]);

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

  const fetchTotalEntries = async () => {
    try {
      const response = await fetch('/api/count', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setTotalEntries(data.count);
    } catch (error) {
      console.error('Error fetching total entries:', error);
    }
  };

  useEffect(() => {
    fetchTotalEntries();
  }, []);

  useEffect(() => {
    const todaysEntriesLengthFn = async () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      let monthString = month.toString();
      // put a 0 in front of month if it is less than 10
      if (month < 10) {
        monthString = `0${month}`;
      }
      const day = today.getDate();
      let dayString = day.toString();
      if (day < 10) {
        dayString = `0${day}`;
      }
      const dateString = `${year}-${monthString}-${dayString}`;

      // call /api/entries
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
      setTodaysEntriesLength(responseData.data.length);
    };

    todaysEntriesLengthFn();
  }, []);

  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.get('query');
    if (query) {
      // open search modal beta with query
      setSearchModalBetaOpen(true);
      setSearchBetaModalQuery(query);
    }
  }, [searchParams]);

  // useEffect(() => {
  //   const fetchEntry = async () => {
  //     // fetch random entry
  //     handleRandom();
  //   };
  //   fetchEntry();
  // }, []);

  // get log entries
  const fetchLogEntries = async () => {
    try {
      const response = await fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit: 20,
        }),
      });
      const data = await response.json();
      // if createdAt == updatedAt, say "added", else "updated"
      const log = data.data
        .map((entry: any) => {
          // skip entries with parent_id
          if (entry.metadata.parent_id) {
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

      setLogEntries(log);

      // add favicon to each entry
      const faviconPromises = log.map(async (entry: any) => {
        if (entry.metadata.author) {
          const favicon = await fetchFavicon(entry.metadata.author);
          return { ...entry, favicon: favicon.favicon };
        }

        return entry;
      });

      const faviconData = await Promise.all(faviconPromises);
      setLogEntries(faviconData);
    } catch (error) {
      console.error('Error fetching log entries:', error);
    }
  };

  useEffect(() => {
    fetchLogEntries();
  }, []);

  const closeModal = () => {
    setSearchModalBetaOpen(false);
    setHelpModalOpen(false);
    setUploaderModalOpen(false);
  };

  const handleRandomOpen = async () => {
    // fetch a random entry and open it
    const entry = await fetchRandomEntry();
    router.push(`/dashboard/entry/${entry.id}`);
  };

  const [platformToken, setPlatformToken] = useState('');

  useEffect(() => {
    // Retrieve the token from cookies when the component mounts
    const match = document.cookie.match(/(^| )platformToken=([^;]+)/);
    if (match) {
      setPlatformToken(match[2] || '');
    }
  }, []);

  const handleTokenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newToken = event.target.value;
    setPlatformToken(newToken);
    // Save the token to cookies
    document.cookie = `platformToken=${newToken}; path=/;`;
  };

  return (
    <div>
      <h1 className="mx-2 mt-8 text-xl font-extrabold text-gray-900 md:text-xl lg:text-xl">
        Welcome to the{' '}
        <span className="bg-gradient-to-r from-sky-400 to-emerald-600 bg-clip-text text-transparent">
          Your Commonbase Launch Party!!
        </span>
      </h1>
      <input
        type="password"
        placeholder="Paste your Launch Party Personal Access Token here"
        style={{ fontSize: '17px' }}
        className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        value={platformToken}
        onChange={handleTokenChange}
      />

      <h2 className="mx-2 mt-8 text-xl font-extrabold text-gray-400 md:text-lg lg:text-lg">
        What do you want to accomplish today?
      </h2>
      <div className="mx-2 my-4">
        <button
          type="button"
          className="my-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4"
          onClick={() => {
            setSearchModalBetaOpen(true);
            const intervalId = setInterval(() => {
              const input = document.getElementById('modal-beta-search');
              if (input) {
                setTimeout(() => {
                  input.focus();
                }, 100);
                clearInterval(intervalId); // Stop the interval once the input is focused
              }
            }, 100);
          }}
        >
          I want to find something specific
        </button>
        <button
          type="button"
          className="my-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4"
          onClick={() => {
            handleRandomOpen();
          }}
        >
          I want to open a random entry
        </button>
        <button
          type="button"
          className="my-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4"
          onClick={() => {
            setUploaderModalOpen(true);
            const intervalId = setInterval(() => {
              const input = document.getElementById('modal-message');
              if (input) {
                setTimeout(() => {
                  input.focus();
                }, 100);
                clearInterval(intervalId); // Stop the interval once the input is focused
              }
            }, 100);
          }}
        >
          I want to add a text/image/ShareYCB entry
        </button>
        <button
          type="button"
          className="my-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4"
          onClick={() => {
            setUploaderModalType('text');
            setUploaderModalOpen(true);
            const intervalId = setInterval(() => {
              const input = document.getElementById('modal-message');
              if (input) {
                setTimeout(() => {
                  input.focus();
                }, 100);
                // highlight the text
                (input as HTMLInputElement).setSelectionRange(
                  0,
                  (input as HTMLInputElement).value.length,
                );
                clearInterval(intervalId); // Stop the interval once the input is focused
              }
            }, 100);
          }}
        >
          I want to add a text entry
        </button>
        <button
          type="button"
          className="my-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4"
          onClick={() => {
            setUploaderModalType('url');
            setUploaderModalOpen(true);
            const intervalId = setInterval(() => {
              const input = document.getElementById('modal-message-author');
              if (input) {
                setTimeout(() => {
                  input.focus();
                }, 100);
                // highlight the text
                (input as HTMLInputElement).setSelectionRange(
                  0,
                  (input as HTMLInputElement).value.length,
                );
                clearInterval(intervalId); // Stop the interval once the input is focused
              }
            }, 100);
          }}
        >
          I want to add a URL entry
        </button>
        {/* todo: implement image upload seperate modal */}
        {/* <button
          type="button"
          className="my-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4"
          onClick={() => {
            setUploaderModalOpen(true);
          }}
        >
          I want to add upload a URL
        </button>
        <button
          type="button"
          className="my-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4"
          onClick={() => {
            setUploaderModalOpen(true);
          }}
        >
          I want to upload a image
        </button> */}

        {/* <button
          type="button"
          className="my-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4"
          onClick={() => {
            // open the flow page
            router.push("/dashboard/flow");
          }}
        >
          I want to journal
        </button> */}
        {/* <button
          type="button"
          className="my-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4"
          onClick={() => {
            // open a modal with instructions
            setHelpModalOpen(true);
            setInstructions([
              {
                text: 'Note! You can hit the random button in the speed dial in the corner on any page in the Companion to get a random entry. Press the button below to be taken to a random entry.',
                img: 'https://imagedelivery.net/CrhaOMV08a-ykXmRKTxGRA/6bd285af-7268-4433-9916-4b23631edd00/public',
              },
            ]);

            setButtons([
              {
                label: 'Random',
                handler: () => {
                  handleRandomOpen();
                },
              },
            ]);
          }}
        >
          I want to browse
        </button> */}
        <button
          type="button"
          className="my-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4"
          onClick={() => {
            setHelpModalOpen(true);
            setInstructions([
              {
                text: 'To connect entries, you can add a comment or create a wikilink. This makes Your Commonbase much more expansive and allows you to connect your thoughts and ideas in a way that is not possible with a traditional wiki.',
              },
              {
                text: 'To add a comment, click on the entry you want to comment on and then click the "Add Comment" button. Make sure to save it by clicking the save button.',
                img: 'https://imagedelivery.net/CrhaOMV08a-ykXmRKTxGRA/61f586bb-412a-476f-dfe8-b79fb0643400/public',
              },
              {
                text: 'To create a wikilink, put double brackets around the text you want to link, like [[this is a link]].',
                img: 'https://imagedelivery.net/CrhaOMV08a-ykXmRKTxGRA/1db94277-9be7-4d4e-847c-2ef0dcb0bb00/public',
              },
              {
                text: 'Close this window and use the "I want to browse" button or "I want to find something specific" button to continue to an entry you want to connect.',
              },
            ]);
            setButtons([null, null, null, null]);
          }}
        >
          I want to connect my entries
        </button>
        {/* <button
          type="button"
          className="my-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4"
          onClick={() => {
            setHelpModalOpen(true);
            setInstructions([
              {
                text: 'To add a new entry from inside companion, click the "Upload" button in the speed dial in the corner on any page in the Companion. You can also press the hotkey cmd/ctrl + u anywhere on the website.',
                img: 'https://imagedelivery.net/CrhaOMV08a-ykXmRKTxGRA/6bd285af-7268-4433-9916-4b23631edd00/public',
              },
              {
                text: 'To add a entry from Chrome, use the Chrome extension.',
              },
              {
                text: 'To add a entry from iOS, use the iOS Shortcut.',
              },
            ]);

            setButtons([
              {
                label: 'Upload',
                handler: () => setUploaderModalOpen(true),
              },
              {
                label: 'Open Chrome Extension',
                handler: () => {
                  window.open(
                    'https://github.com/bramses/simple-chrome-ycb',
                    '_blank',
                  );
                },
              },
              null,
            ]);
          }}
        >
          I want to add something new
        </button> */}
        <button
          type="button"
          className="my-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4"
          onClick={() => {
            const formattedDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              .toLocaleDateString()
              .split('/')
              .map((d) => (d.length === 1 ? `0${d}` : d))
              .join('-');
            router.push(`/dashboard/garden?date=${formattedDate}`);
          }}
        >
          I want to see what I saved exactly one week ago
        </button>
        {/* <button
          type="button"
          className="my-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4"
        >
          I want to share something with others
        </button> */}
        {/* <Link
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
        )} */}
      </div>
      {/* <ForceFromEntry inputEntry={randomEntry} inputComments={comments} /> */}
      <HelpModal
        isOpen={isHelpModalOpen || false}
        closeModalFn={() => closeModal()}
        stepButtons={buttons}
        instructions={instructions}
      />
      <SearchModalBeta
        isOpen={isSearchModalBetaOpen || false}
        closeModalFn={() => closeModal()}
        inputQuery={searchBetaModalQuery}
      />
      <UploaderModalWrapper
        isOpen={isUploaderModalOpen || false}
        type={uploaderModalType}
        closeModalFn={() => closeModal()}
      />
      {/* {randomEntry && (
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
      )} */}

      {/* todo time machine */}
      {/* <div>
        <h1 className="my-4 text-xl font-extrabold text-gray-900 md:text-xl lg:text-xl">
          Last {timeMachine}, you saved:
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
            Next
          </button>
        )}
        {randomTimeMachineEntry && (
          <Link
            href={{
              pathname: `/dashboard/entry/${randomTimeMachineEntry.id}`,
            }}
            className="block text-gray-900 no-underline"
          >
            <div className="relative">
              {randomTimeMachineEntry.metadata.author &&
                randomTimeMachineEntry.metadata.author.includes(
                  'imagedelivery.net',
                ) && (
                  <img
                    src={randomTimeMachineEntry.metadata.author}
                    alt="ycb-companion-image"
                  />
                )}
              <span className="font-normal">{randomTimeMachineEntry.data}</span>
            </div>
          </Link>
        )}
      </div> */}
      {/* ask the user what they are thinking about right now in a text box and add it as an entry -- like a journal */}
      {/* <h1 className="my-4 text-xl font-extrabold text-gray-900 md:text-xl lg:text-xl">
        Journal
      </h1>
      <div className="mx-2 my-4">
        <textarea
          id="journal-message"
          rows={4}
          className="mt-4 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          style={{ fontSize: "17px" }}
          placeholder="What are you thinking about right now?"
        />
        <button
          type="button"
          onClick={async () => {
            const journalMessage = (
              document.getElementById("journal-message") as HTMLInputElement
            ).value;
            if (!journalMessage) {
              return;
            }
            setIsSaving(true); // Set loading state
            try {
              // add the journal message as an entry
              await fetch("/api/add", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  data: journalMessage,
                  metadata: {
                    author: "https://ycb-companion.onrender.com/dashboard",
                    title: "Journal",
                  },
                }),
              });
              (
                document.getElementById("journal-message") as HTMLInputElement
              ).value = ""; // Clear textarea
              await fetchLogEntries(); // Reload log entries
            } catch (error) {
              console.error("Error saving journal entry:", error);
            } finally {
              setIsSaving(false); // Reset loading state
            }
          }}
          disabled={isSaving} // Disable button while saving
          className={`mt-2 w-full rounded-lg ${
            isSaving ? "bg-gray-400" : "bg-blue-700"
          } px-5 py-2.5 text-sm font-medium text-white ${
            isSaving ? "" : "hover:bg-blue-800"
          } focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800`}
        >
          {isSaving ? "Loading..." : "Save"}
        </button>
      </div> */}

      {totalEntries >= 0 && (
        <h2 className="mx-2 mt-8 text-xl font-extrabold text-gray-400 md:text-lg lg:text-lg">
          You have{' '}
          <span className="bg-gradient-to-r from-sky-400 to-emerald-600 bg-clip-text text-transparent">
            {totalEntries}
          </span>{' '}
          total entries in your commonbase. That&apos;s the equivalent of{' '}
          <span className="bg-gradient-to-r from-sky-400 to-emerald-600 bg-clip-text text-transparent">
            {Math.round(totalEntries / 251)}
          </span>{' '}
          journals filled! You are{' '}
          <span className="bg-gradient-to-r from-sky-400 to-emerald-600 bg-clip-text text-transparent">
            {251 - (totalEntries % 251)}
          </span>{' '}
          entries away from filling your next journal!
        </h2>
      )}

      <h2 className="mx-2 mt-8 text-xl font-extrabold text-gray-400 md:text-lg lg:text-lg">
        You have{' '}
        <AnimatedNumbers
          includeComma
          transitions={(index) => ({
            type: 'spring',
            duration: index + 0.3,
          })}
          animateToNumber={todaysEntriesLength}
          fontStyle={{
            fontSize: 18,
            color: 'black',
          }}
        />
        entries today!
      </h2>

      <h1 className="my-4 text-xl font-extrabold text-gray-900 md:text-xl lg:text-xl">
        Recent Activity Log
      </h1>
      <div className="mx-2 my-4 w-full overflow-auto">
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
                    {entry.metadata.author &&
                      entry.metadata.author.includes('imagedelivery.net') && (
                        <img
                          src={entry.metadata.author}
                          alt="ycb-companion-image"
                        />
                      )}
                    <span className="flex items-center font-normal">
                      <img
                        src={entry.favicon || '/favicon.ico'}
                        alt="favicon"
                        className="mr-2 size-6"
                      />
                      {entry.data}
                    </span>
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
