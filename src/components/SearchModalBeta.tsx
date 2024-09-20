/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/img-redundant-alt */

import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import { splitIntoWords, toHostname } from '@/helpers/functions';

const SearchModalBeta = ({
  isOpen,
  closeModalFn,
  onSearch,
  inputQuery,
}: {
  isOpen: boolean;
  closeModalFn: () => void;
  onSearch: (query: string) => Promise<any[]>;
  inputQuery: string;
}) => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [firstLastName, setFirstLastName] = useState({
    firstName: '',
    lastName: '',
  });

  const { user, isLoaded } = useUser();

  // on open focus on the input
  useEffect(() => {
    const input = document.getElementById('modal-beta-search');
    console.log('input:', input);
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
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModalFn}
      contentLabel="Edit Modal"
      ariaHideApp={false}
    >
      <button onClick={closeModalFn} type="button">
        (close)
      </button>
      {/* add a search bar that user can type in a query that gets sent to parent on click, renders a list of results  and then user can click on button next to result to add as link to entry */}
      <div className="">
        <input
          id="modal-beta-search"
          defaultValue={inputQuery}
          type="text"
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Search"
        />
        <button
          type="button"
          className="mb-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-gray-300"
          onClick={async () => {
            const query = (
              document.getElementById('modal-beta-search') as HTMLInputElement
            ).value;
            if (!query) {
              return;
            }
            setIsLoading(true);
            const ress = await onSearch(query);
            setSearchResults(ress);
            setIsLoading(false);
          }}
        >
          {isLoading ? 'Loading...' : 'Search'}
        </button>
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
    </Modal>
  );
};

export default SearchModalBeta;
