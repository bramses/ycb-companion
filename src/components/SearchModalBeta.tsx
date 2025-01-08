/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable no-underscore-dangle */

import { useUser } from '@clerk/nextjs';
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import type { SearchClient } from 'instantsearch.js';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { InstantSearch, useHits, useSearchBox } from 'react-instantsearch';
import Modal from 'react-modal';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import {
  fetchSearchEntries,
  splitIntoWords,
  toHostname,
} from '@/helpers/functions';

const CustomSearchBox = ({ setSemanticSearchResults }: any) => {
  const { query, refine } = useSearchBox();

  return (
    <input
      id="modal-beta-search"
      onChange={(e) => {
        refine(e.target.value);
        setSemanticSearchResults();
      }} // Use refine to update the search query
      type="text"
      style={{ fontSize: '17px' }}
      value={query} // Bind input value to the search query
      className="mb-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
      placeholder="Search"
    />
  );
};

const CustomHit = ({ hit, closeModalFn }: any) => {
  return (
    <div key={hit.id}>
      <div className="mx-2 mb-4 flex items-center justify-between">
        <div className="grow">
          <Link
            href={{
              pathname: `/dashboard/entry/${hit.id}`,
            }}
            onClick={() => {
              closeModalFn();
            }}
            className="block text-gray-900 no-underline"
          >
            <div className="relative">
              <span
                className="font-normal"
                dangerouslySetInnerHTML={{
                  __html: hit._highlightResult.data.value,
                }}
              />
            </div>
          </Link>
          {hit._highlightResult.metadata.author && (
            <>
              <span>Author: </span>
              <span
                className="font-normal text-gray-500"
                dangerouslySetInnerHTML={{
                  __html: hit._highlightResult.metadata.author.value,
                }}
              />
              <br />
            </>
          )}
          {hit._highlightResult.metadata.title && (
            <>
              <span>Title: </span>
              <span
                className="font-normal text-gray-500"
                dangerouslySetInnerHTML={{
                  __html: hit._highlightResult.metadata.title.value,
                }}
              />
            </>
          )}

          <div className="text-sm text-gray-500">
            Created: {new Date(hit.created_at).toLocaleString()}
            {hit.createdat !== hit.updated_at && (
              <> | Last Updated: {new Date(hit.updated_at).toLocaleString()} </>
            )}
          </div>
        </div>
      </div>
      <hr className="my-4" />
    </div>
  );
};

const CustomHits = ({ hits, closeModalFn }: any) => {
  const { items } = useHits(hits);

  return (
    <div>
      {items.map((item: any) => (
        <CustomHit key={item.id} hit={item} closeModalFn={closeModalFn} />
      ))}
    </div>
  );
};

const SearchModalBeta = ({
  isOpen,
  closeModalFn,
  inputQuery,
}: {
  isOpen: boolean;
  closeModalFn: () => void;
  inputQuery: string;
}) => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [firstLastName, setFirstLastName] = useState({
    firstName: '',
    lastName: '',
  });

  const { user, isLoaded } = useUser();

  const handleSearchHelper = async (entryData: string) => {
    const parsedEntries = await fetchSearchEntries(
      entryData,
      setSearchResults,
      null,
    );
    return parsedEntries;
  };

  const handleSearch = async (entryData: string, _: string) => {
    const parsedEntries = await handleSearchHelper(entryData);
    console.log(`setting to ${parsedEntries}`);
    setSearchResults(parsedEntries);
  };

  const [isSearchClient, setSearchClient] = useState<SearchClient | null>(null);

  const fetchToken = async () => {
    try {
      const token = await fetch('/api/searchToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const tokenData = await token.json();

      if (tokenData.error) {
        throw new Error(tokenData.error);
      }
      if (Object.keys(tokenData).length === 0) {
        throw new Error('No token data returned from the API');
      }

      const { searchClient } = instantMeiliSearch(
        process.env.MEILI_HOST!, // Host
        tokenData.token.token, // API key,
        {
          placeholderSearch: true, // default: true.
        },
      );

      setSearchClient(searchClient);
    } catch (err) {
      console.error('Error fetching search token:', err);
    }
  };

  const handleSearchError = (error: any) => {
    if (error.message.includes('Tenant token expired')) {
      console.warn('Tenant token expired, fetching a new token...');
      fetchToken(); // Re-fetch the token
    } else {
      console.error('Search error:', error);
    }
  };

  useEffect(() => {
    const initializeSearchClient = async () => {
      try {
        await fetchToken();
      } catch (error) {
        handleSearchError(error);
      }
    };

    initializeSearchClient();
  }, []);

  // on open focus on the input
  useEffect(() => {
    const input = document.getElementById('modal-beta-search');
    if (input) {
      input.focus();
    }
  }, []);

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

  const renderResultData = (result: any) => {
    if (
      result &&
      result.author &&
      result.author.includes('imagedelivery.net')
    ) {
      return <img src={result.author} alt="Image" />;
    }

    if (result && result.code) {
      return (
        <SyntaxHighlighter
          language={
            result.language === 'typescriptreact' ? 'tsx' : result.language
          }
          style={docco}
          wrapLines
          wrapLongLines
          customStyle={{ height: '200px', overflow: 'scroll' }}
        >
          {result.code}
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

  const renderResultDataWMetaData = (result: any) => {
    console.log('result:', result);
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

  const [inputValue, setInputValue] = useState(inputQuery);

  // any keystroke in query input after search is called should clear the search results
  useEffect(() => {
    if (searchResults.length > 0) {
      setSearchResults([]);
    }
  }, [inputValue]);

  useEffect(() => {
    if (inputQuery !== inputValue) {
      setInputValue(inputQuery);
    }
  }, [inputQuery]);

  // enter key press event handler
  const handleEnterKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch(inputValue, '');
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleEnterKeyPress);

    return () => {
      window.removeEventListener('keydown', handleEnterKeyPress);
    };
  }, []);

  const setSemanticSearchResults = () => {
    setSearchResults([]);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModalFn}
      contentLabel="Edit Modal"
      ariaHideApp={false}
    >
      {isSearchClient ? (
        <InstantSearch
          searchClient={isSearchClient}
          indexName="commonbase_prod"
        >
          <button onClick={closeModalFn} type="button">
            (close)
          </button>
          {/* add a search bar that user can type in a query that gets sent to parent on click, renders a list of results  and then user can click on button next to result to add as link to entry */}
          <div className="">
            <CustomSearchBox
              setSemanticSearchResults={setSemanticSearchResults}
            />
            <div className="mt-4 flex space-x-2">
              <button
                type="button"
                className="mb-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-gray-300"
                onClick={async () => {
                  const query = (
                    document.getElementById(
                      'modal-beta-search',
                    ) as HTMLInputElement
                  ).value;
                  if (!query) {
                    return;
                  }
                  setIsLoading(true);
                  await handleSearch(query, '');
                  setIsLoading(false);
                }}
              >
                {isLoading ? 'Loading...' : 'Search'}
              </button>
              <button
                type="button"
                onClick={() => {
                  window.open(
                    `https://www.google.com/search?q=${inputValue}`,
                    '_blank',
                  );
                }}
                className="mb-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-gray-300"
              >
                Search the Web
              </button>
            </div>
            {searchResults.map((result: any) => (
              <>
                <div key={result.id} className="mt-4">
                  <Link
                    href={{
                      pathname: `/dashboard/entry/${result.id}`,
                    }}
                    onClick={() => {
                      closeModalFn();
                    }}
                    className="block text-gray-900 no-underline"
                  >
                    <div className="relative">
                      <span className="font-normal">
                        {renderResultDataWMetaData(result)}
                      </span>
                    </div>
                    <div className="ml-6 flex items-center">
                      {result.parentData ? (
                        <>
                          <div className="mr-2 flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-300 text-xs font-bold text-white">
                            {firstLastName.firstName &&
                            firstLastName.lastName ? (
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
                  <div className="text-sm text-gray-500">
                    <span className="font-normal">
                      {Math.round(result.similarity * 100)}% similar
                    </span>
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
                <hr className="my-4" />
              </>
            ))}
            <CustomHits hits={searchResults} closeModalFn={closeModalFn} />
          </div>
        </InstantSearch>
      ) : (
        <div className="">
          <input
            id="modal-beta-search"
            onChange={(e) => setInputValue(e.target.value)} // Update state on change
            type="text"
            style={{ fontSize: '17px' }}
            value={inputValue}
            className="mb-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Search"
          />
          <div className="mt-4 flex space-x-2">
            <button
              type="button"
              className="mb-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-gray-300"
              onClick={async () => {
                const query = (
                  document.getElementById(
                    'modal-beta-search',
                  ) as HTMLInputElement
                ).value;
                if (!query) {
                  return;
                }
                setIsLoading(true);
                await handleSearch(query, '');
                setIsLoading(false);
              }}
            >
              {isLoading ? 'Loading...' : 'Search'}
            </button>
            <button
              type="button"
              onClick={() => {
                window.open(
                  `https://www.google.com/search?q=${inputValue}`,
                  '_blank',
                );
              }}
              className="mb-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-gray-300"
            >
              Search the Web
            </button>
          </div>

          <div className="">
            {searchResults.map((result) => (
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
                      onClick={() => {
                        closeModalFn();
                      }}
                      className="block text-gray-900 no-underline"
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
                              {firstLastName.firstName &&
                              firstLastName.lastName ? (
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
                    <button
                      type="button"
                      className="ms-2 inline-flex items-center rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4"
                      onClick={() => {
                        setInputValue(`"metadata:${result.metadata.title}"`);
                      }}
                    >
                      Search Metadata
                    </button>
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
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default SearchModalBeta;
