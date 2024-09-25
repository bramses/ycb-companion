/* eslint-disable @next/next/no-img-element */

'use client';

import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Label, Pie, PieChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { ChartConfig } from '@/components/ui/chart';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { appendSearchToCache, clearCache, getCache } from '@/helpers/cache';

import {
  fetchList,
  fetchSearchEntries,
  splitIntoWords,
} from '../helpers/functions';
import Loading from './Loading';

const CustomLabel = ({
  viewBox,
  entriesCreated,
  entriesUpdated,
}: {
  viewBox: any;
  entriesCreated: number;
  entriesUpdated: number;
}) => {
  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
    return (
      <text
        x={viewBox.cx}
        y={viewBox.cy}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        <tspan
          x={viewBox.cx}
          y={viewBox.cy}
          className="fill-foreground text-3xl font-bold"
        >
          {entriesCreated + entriesUpdated}
        </tspan>
        <tspan
          x={viewBox.cx}
          y={(viewBox.cy || 0) + 24}
          className="fill-muted-foreground"
        >
          Entries
        </tspan>
      </text>
    );
  }
  return null;
};

const SearchResults = () => {
  const { user, isLoaded } = useUser();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [textAreaValue, setTextAreaValue] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  // const [checkedButtons, setCheckedButtons] = useState<{
  //   [key: string]: boolean;
  // }>({});
  // const [buildingCollection, setBuildingCollection] = useState(false);
  const [entriesCreated, setEntriesCreated] = useState(0);
  const [entriesUpdated, setEntriesUpdated] = useState(0);

  const [firstLastName, setFirstLastName] = useState({
    firstName: '',
    lastName: '',
  });

  const searchParams = useSearchParams();
  // const router = useRouter();
  const pathname = usePathname();
  const [rndmBtnText, setRndmBtnText] = useState('Random');
  const cache = getCache();

  const createQueryString = useCallback(
    (name: string, value: string, basePath: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      if (basePath) {
        return `${basePath}?${params.toString()}`;
      }

      return params.toString();
    },
    [searchParams],
  );

  const toHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch (err) {
      return url;
    }
  };

  const handleSearch = async (query: string) => {
    if (query === '') return;
    if (query === '_clear_cache') {
      clearCache();
      alert('Cache cleared!');
      return;
    }
    const searchQuery = query || textAreaValue;

    console.log('Searching for:', searchQuery);
    setShowLoading(true);
    setSearchResults([]);

    // check if the query is in cache
    if (cache.searches[searchQuery]) {
      console.log('Cache hit!');
      console.log('cache.searches[searchQuery]:', cache.searches[searchQuery]);
      setSearchResults(cache.searches[searchQuery]);
      setShowLoading(false);
      return;
    }

    const parsedEntries = await fetchSearchEntries(
      searchQuery,
      setSearchResults,
      setShowLoading,
    );

    setShowLoading(false);

    setSearchResults(parsedEntries);
  };

  const renderResultData = (result: any) => {
    if (
      result.metadata &&
      result.metadata.author &&
      result.metadata.author.includes('imagedelivery.net')
    ) {
      return <img src={result.metadata.author} alt="ycb-companion-image" />;
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

    if (result.parentData) {
      return result.parentData.data;
    }

    if (result.data.split(' ').length > 2200) {
      return (
        <>
          {splitIntoWords(result.data, 22, 0)}...
          <span className="mt-1 block text-sm text-gray-500">
            ...{splitIntoWords(result.data, 22, 22)}...
          </span>
        </>
      );
    }
    return result.data;
  };

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
    const query = searchParams.get('query');
    console.log('query:', query);
    if (query) {
      setTextAreaValue(query);
      handleSearch(query);
    }
  }, [searchParams]);

  // check local storage for collection being built (ar array of objects)
  // useEffect(() => {
  //   if (localStorage.getItem('buildingCollection')) {
  //     setBuildingCollection(true);
  //   }
  // }, [buildingCollection]);

  // when searchResults change, append to cache
  useEffect(() => {
    if (searchResults.length > 0)
      appendSearchToCache(textAreaValue, searchResults);
  }, [searchResults]);

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

  const fetchRecentEntries = async (calledManually = false) => {
    // only run if searchResults is empty and no query in searchParams
    if (
      !calledManually &&
      (searchResults.length > 0 || searchParams.has('query'))
    )
      return;
    setShowLoading(true);
    setSearchResults([]);
    await fetchList(setSearchResults as any, 1);
    setShowLoading(false);
  };

  // on load page, fetch recent entries using fetchList function and set searchResults to the data
  useEffect(() => {
    fetchRecentEntries();
  }, []);

  useEffect(() => {
    if (textAreaValue) {
      document.title = `Search: ${textAreaValue}`;
    }
  }, [textAreaValue]);

  useEffect(() => {
    // fetch created and updated entries from /api/entriesSummary
    const fetchEntriesSummary = async () => {
      try {
        const response = await fetch('/api/entriesSummary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            numDays: 1,
          }),
        });
        const data = await response.json();
        console.log('Entries summary:', data);
        setEntriesCreated(data.data.created);
        setEntriesUpdated(data.data.updated);
      } catch (error) {
        console.error('Error fetching entries summary:', error);
      }
    };

    fetchEntriesSummary();
  }, []);

  const chartData = [
    {
      browser: 'created',
      visitors: entriesCreated,
      fill: 'var(--color-chrome)',
    },
    {
      browser: 'updated',
      visitors: entriesUpdated,
      fill: 'var(--color-safari)',
    },
  ];
  const chartConfig = {
    visitors: {
      label: 'Entries',
    },
    chrome: {
      label: 'Created',
      color: 'hsl(var(--chart-1))',
    },
    safari: {
      label: 'Updated',
      color: 'hsl(var(--chart-2))',
    },
  } satisfies ChartConfig;

  // const totalVisitors = useMemo(() => {
  //   return entriesCreated;
  // }, []);

  const renderCustomLabel = (
    props: any,
    entriesCreatedLabel: number,
    entriesUpdatedLabel: number,
  ) => (
    <CustomLabel
      viewBox={props.viewBox}
      entriesCreated={entriesCreatedLabel}
      entriesUpdated={entriesUpdatedLabel}
    />
  );

  return (
    <div className="min-w-full">
      <textarea
        ref={textAreaRef}
        id="message"
        rows={2}
        style={{ fontSize: '17px' }}
        className="top-2 mt-4 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        placeholder="Your query... (Press Enter to search) (Press cmd-k to focus) (Press cmd + u anywhere on website to fast upload)"
        value={textAreaValue}
        onChange={(e) => setTextAreaValue(e.target.value)}
        onFocus={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch(textAreaValue);
          }
        }}
      />

      <button
        type="button"
        onClick={() => handleSearch(textAreaValue)}
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
      {/* refresh feed btn (empty textarea and fetch recent entries) */}
      <button
        type="button"
        onClick={() => {
          setTextAreaValue('');
          fetchRecentEntries(true);
        }}
        className="mb-8 me-2 mt-4 w-full rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Refresh Feed
      </button>
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Entries Made & Entries Gardened</CardTitle>
          <CardDescription>{new Date().toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="visitors"
                nameKey="browser"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={(props) =>
                    renderCustomLabel(props, entriesCreated, entriesUpdated)
                  }
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 font-medium leading-none">
            Try to keep a 1:1 ratio of new entries to updates. Updating entries
            increase the density of Your Commonbase and make it much better at
            connecting your thoughts. If you don&apos;t know where to start, hit
            the random button in the speed dial in the corner!
          </div>
          <div className="leading-none text-muted-foreground">
            You&apos;ll see a weekly result in your email inbox on Sundays
          </div>
        </CardFooter>
      </Card>
      {/* download collection btn only if buildingCollection is true */}
      {/* {buildingCollection && (
        <button
          type="button"
          onClick={() => {
            // clear the buildingCollection key from localStorage and download the collection as a json file
            downloadCollection(setCheckedButtons);
            setBuildingCollection(false);
          }}
          className="mb-2 me-2 mt-4 w-full rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Download Trail
        </button>
      )} */}
      {showLoading && <Loading />}
      {searchResults.map((result) => (
        <>
          <div
            key={result.id}
            className="mx-2 my-4 flex items-center justify-between"
          >
            <div className="grow">
              <Link
                href={{
                  pathname: `/dashboard/entry/${result.id}`,
                }}
                className="block text-gray-900 no-underline"
                onClick={() => {
                  if (textAreaValue === '') {
                    return;
                  }
                  window.history.pushState(
                    {},
                    '',
                    createQueryString('query', textAreaValue, pathname),
                  );
                }}
              >
                <div className="relative">
                  <Image
                    src={result.favicon}
                    alt="favicon"
                    width={16}
                    height={16}
                    className="float-left mr-2"
                  />
                  <span className="font-normal">
                    {renderResultData(result)}
                  </span>
                </div>
                <div className="ml-6 flex items-center">
                  {result.parentData ? (
                    <>
                      <div className="mr-2 flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-300 text-xs font-bold text-white">
                        {firstLastName.firstName && firstLastName.lastName ? (
                          <>
                            {firstLastName.firstName[0]}
                            {firstLastName.lastName[0]}
                          </>
                        ) : (
                          'yCb'
                        )}
                      </div>
                      <span className="font-normal">{result.data}</span>
                    </>
                  ) : null}
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
              <a
                target="_blank"
                href={result.metadata.author}
                rel="noopener noreferrer"
                className="inline-flex items-center font-medium text-blue-600 hover:underline"
              >
                {toHostname(result.metadata.author)}
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
            {/* <button
              type="button"
              className={`ml-4 rounded-full p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                checkedButtons[result.id] ? 'bg-green-500' : 'bg-blue-500'
              }`}
              onClick={() =>
                addToCollection(
                  result.id,
                  result.data,
                  buildingCollection,
                  setBuildingCollection,
                  setCheckedButtons,
                )
              }
            >
              {checkedButtons[result.id] ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              )}
            </button> */}
          </div>
          <hr className="my-4" />
        </>
      ))}
    </div>
  );
};

export default SearchResults;
