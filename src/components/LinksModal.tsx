import Image from 'next/image';
import { useState } from 'react';
import Modal from 'react-modal';

import { splitIntoWords, toHostname } from '@/helpers/functions';

const LinksModal = ({
  isOpen,
  closeModalFn,
  onSave,
  onSearch,
}: {
  isOpen: boolean;
  closeModalFn: () => void;
  onSave: (name: string, url: string) => void;
  onSearch: (query: string) => Promise<any[]>;
}) => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModalFn}
      contentLabel="Edit Modal"
      ariaHideApp={false}
      className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm
        -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-4 shadow-lg"
    >
      <button onClick={closeModalFn} type="button">
        (close)
      </button>
      <h2 className="mb-2 text-lg font-semibold text-gray-900">Add a Link:</h2>
      <input
        id="link-name"
        type="text"
        style={{ fontSize: '17px' }}
        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        placeholder="Name"
      />
      <input
        id="link-url"
        type="text"
        style={{ fontSize: '17px' }}
        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        placeholder="URL"
      />

      <div className="flex space-x-2">
        <button
          type="button"
          className="mb-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-gray-300"
          onClick={() => {
            const name = (
              document.getElementById('link-name') as HTMLInputElement
            ).value;
            const url = (
              document.getElementById('link-url') as HTMLInputElement
            ).value;
            if (!name || !url) {
              return;
            }

            // send data to parent
            onSave(name, url);
            closeModalFn();
          }}
        >
          Save
        </button>
      </div>
      {/* add a search bar that user can type in a query that gets sent to parent on click, renders a list of results  and then user can click on button next to result to add as link to entry */}
      <div className="">
        <input
          id="link-search"
          type="text"
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Search"
        />
        <button
          type="button"
          className="mb-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-gray-300"
          onClick={async () => {
            const query = (
              document.getElementById('link-search') as HTMLInputElement
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
        <div style={{ height: '200px' }} className="overflow-scroll">
          {searchResults.map((result: any) => (
            <div
              key={result.id}
              className="mb-4 flex items-center justify-between"
            >
              <div className="grow">
                <button
                  onClick={() =>
                    onSave(result.data, `/dashboard/entry/${result.id}`)
                  }
                  className="block cursor-pointer"
                  type="button"
                >
                  <div className="flex items-center text-blue-600 hover:underline">
                    <Image
                      src={result.favicon || '/favicon.ico'}
                      alt="favicon"
                      width={16}
                      height={16}
                      className="mr-2"
                    />
                    <span className="font-medium">
                      {result.data.split(' ').length > 12 ? (
                        <>
                          {splitIntoWords(result.data, 12, 0)}...
                          <span className="mt-1 block text-sm text-gray-500">
                            ...{splitIntoWords(result.data, 20, 12)}...
                          </span>
                        </>
                      ) : (
                        result.data
                      )}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {result.parentData && (
                      <span className="mt-1 block">
                        {result.parentData.data}
                      </span>
                    )}
                  </div>
                </button>
                {/* when was the entry created and updated */}
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
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default LinksModal;
