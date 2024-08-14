/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */

'use client';

import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

import { useState } from 'react';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import { Tweet } from 'react-tweet';

const Entry = ({
  hasAliases: initialHasAliases = false,
  // hasCollections: initialHasCollections = false,
  hasYouTubeEmbed: initialHasYouTubeEmbed = false,
  hasTwitterEmbed: initialHasTwitterEmbed = false,
  tweetId = '',
  youtubeId = '',
  youtubeStart = '',
  data = '',
  title = '',
  author = '',
  createdAt = '',
  similarity = 0,
  imageUrl = '',
  hasImage = false,
  onDelve = (_: string) => {},
  aliases = [],
  selectedIndex = -1,
}) => {
  const [hasAliases] = useState(initialHasAliases);
  // const [hasCollections] = useState(initialHasCollections);
  const [hasYouTubeEmbed] = useState(initialHasYouTubeEmbed);
  const [hasTwitterEmbed] = useState(initialHasTwitterEmbed);

  return (
    <div className="m-4 [&_p]:my-6">
      <div className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
        {hasYouTubeEmbed && (
          <LiteYouTubeEmbed
            id={youtubeId}
            params={`start=${youtubeStart}`}
            title="Japan is messing up the world economy - YouTube"
          />
        )}

        {hasImage && (
          <img className="h-auto w-full" src={imageUrl} alt="Image" />
        )}

        {hasTwitterEmbed && <Tweet id={tweetId} />}

        <p className="mb-3 font-normal text-gray-500 dark:text-gray-400">
          {data}
        </p>

        <button
          className="mb-2 me-2 mt-4 w-full rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          type="button"
          onClick={() => {
            // search using data
            onDelve(data);
          }}
        >
          Delve
        </button>

        {hasAliases && (
          <>
            <hr className="mx-auto my-4 h-1 w-48 rounded border-0 bg-gray-100 md:my-10 dark:bg-gray-700" />

            <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Aliases:
            </h2>
            {/* {
    "id": "2449",
    "data": "me at a hot ones interview",
    "metadata": {
        "title": "bingus ✩ on X: \"https://t.co/G8jSTYplMv\" / X",
        "author": "https://x.com/aliaoftheblade/status/1822602088427487358",
        "alias_ids": [
            2450,
            2451,
            2517
        ],
        "s_id": 2449
    },
    "createdAt": "2024-08-12T01:56:14.569Z",
    "updatedAt": "2024-08-12T01:56:14.569Z",
    "aliasData": [
        "dune meme",
        "hot ones meme",
        "hot ones dune"
    ],
    "selectedIndex": 1
} 
map over aliasData and display each alias in a list and put a (*) next to the selected index
and turn each into a link that searches for that alias
*/}
            <ul className="max-w-md list-inside list-disc space-y-1 text-gray-500 dark:text-gray-400">
              {aliases.map((alias, index) => (
                <li key={alias}>
                  {index === selectedIndex ? (
                    <strong className="font-semibold text-gray-900 dark:text-white">
                      {alias} *
                    </strong>
                  ) : (
                    <button
                      type="button"
                      className="font-normal text-blue-600 hover:underline"
                      onClick={() => {
                        // search using alias
                        onDelve(alias);
                      }}
                    >
                      {alias}
                    </button>
                  )}
                </li>
              ))}
            </ul>

            <hr className="mx-auto my-4 h-1 w-48 rounded border-0 bg-gray-100 md:my-10 dark:bg-gray-700" />
          </>
        )}

        <p className="mb-3 font-normal text-gray-500 dark:text-gray-400">
          Added on{' '}
          <strong className="font-semibold text-gray-900 dark:text-white">
            {new Date(createdAt).toLocaleDateString()}
          </strong>{' '}
          with a similarity of{' '}
          <strong className="font-semibold text-gray-900 dark:text-white">
            {Math.round(similarity * 100)}%
          </strong>
        </p>

        <a
          href={author}
          className="inline-flex items-center font-medium text-blue-600 hover:underline"
        >
          {title}
          <svg
            className="ms-2.5 size-3 rtl:rotate-[270deg]"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 18 18"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778"
            />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default Entry;
