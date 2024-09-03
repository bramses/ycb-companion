'use client';

import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  type Dispatch,
  memo,
  type SetStateAction,
  useEffect,
  useState,
} from 'react';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import { InstagramEmbed, TikTokEmbed } from 'react-social-media-embed';
import { Tweet } from 'react-tweet';

import {
  fetchByID,
  fetchSearchEntries,
  formatDate,
  handleAliasAdd,
} from '../helpers/functions';

const EntryPage = () => {
  // fetch data from the server at id on load
  const [data, setData] = useState<{
    data: any;
    metadata: any;
    id: string;
    createdAt: string;
    // updatedAt: string;
    // similarity: number;
    // favicon: string;
  } | null>(null);
  const [author, setAuthor] = useState(''); // author is the URL
  const pathname = usePathname();
  const [hasYouTubeEmbed, setHasYoutubeEmbed] = useState(false);
  const [youtubeId, setYoutubeId] = useState('');
  const [youtubeStart, setYoutubeStart] = useState(0);
  const [tweetId, setTweetId] = useState('');
  const [hasTwitterEmbed, setHasTwitterEmbed] = useState(false);
  const [hasInstagramEmbed, setHasInstagramEmbed] = useState(false);
  const [hasTikTokEmbed, setHasTikTokEmbed] = useState(false);
  const [hasImage, setHasImage] = useState(false);
  const MemoizedInstagramEmbed = memo(InstagramEmbed);
  const MemoizedTikTokEmbed = memo(TikTokEmbed);
  const [hasAliases, setHasAliases] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isAddingAlias, setIsAddingAlias] = useState(false);

  function checkEmbeds(
    res: { data: any; metadata: any },
    fn_setHasYoutubeEmbed: Dispatch<SetStateAction<boolean>>,
    fn_setYoutubeId: Dispatch<SetStateAction<string>>,
    fn_setYoutubeStart: Dispatch<SetStateAction<number>>,
    fn_setHasTwitterEmbed: Dispatch<SetStateAction<boolean>>,
    fn_setTweetId: Dispatch<SetStateAction<string>>,
    fn_setHasInstagramEmbed: Dispatch<SetStateAction<boolean>>,
    fn_setHasTikTokEmbed: Dispatch<SetStateAction<boolean>>,
    fn_setHasImage: Dispatch<SetStateAction<boolean>>,
  ) {
    if (res.metadata.author.includes('youtube.com')) {
      fn_setHasYoutubeEmbed(true);
      fn_setYoutubeId(res.metadata.author.split('v=')[1]?.split('&')[0]);
      if (res.metadata.author.includes('t=')) {
        fn_setYoutubeStart(res.metadata.author.split('t=')[1].split('s')[0]);
      }
    }

    // check if the data has twitter embed
    if (
      res.metadata.author.includes('twitter.com') ||
      /^https:\/\/(www\.)?x\.com/.test(res.metadata.author)
    ) {
      fn_setHasTwitterEmbed(true);
      fn_setTweetId(res.metadata.author.split('/').pop());
    }

    // check if the data has instagram embed
    if (res.metadata.author.includes('instagram.com')) {
      fn_setHasInstagramEmbed(true);
    }

    // check if the data has tiktok embed
    if (res.metadata.author.includes('tiktok.com')) {
      fn_setHasTikTokEmbed(true);
    }

    // check if the data has image
    if (res.metadata.author.includes('imagedelivery.net')) {
      fn_setHasImage(true);
    }
  }

  const handleSearch = async (entryData: string, _: string) => {
    const parsedEntries = await fetchSearchEntries(entryData, setSearchResults);
    setSearchResults(parsedEntries);
  };

  useEffect(() => {
    if (!data) {
      const asyncFn = async () => {
        // get id from pathname by popping the last element
        const id = pathname.split('/').pop();
        if (!id) return;
        const entryId = Array.isArray(id) ? id[0] : id; // Handle both string and string[]
        if (!entryId) return;
        let res;
        const dt = await fetchByID(entryId);

        if ('parent_id' in dt.metadata) {
          const parentData = await fetchByID(dt.metadata.parent_id);
          // set res to parentData
          res = parentData;
        }
        // set res to dt if parentData is not available
        res = res || dt;

        if ('alias_ids' in res.metadata) {
          // fetch plaintext data from alias_ids
          setHasAliases(true);
          Promise.all(
            res.metadata.alias_ids.map((aliasId: string) => fetchByID(aliasId)),
          ).then((aliasData) => {
            // replace alias_ids with aliasData
            res.metadata.aliasData = aliasData.map((ad) => {
              return {
                aliasData: ad.data,
                aliasId: ad.id,
                aliasCreatedAt: formatDate(ad.createdAt),
              };
            });
            console.log(res);
            setData(res);
            return res;
          });
        }

        setData(res);

        // check if the data has youtube embed
        checkEmbeds(
          res,
          setHasYoutubeEmbed,
          setYoutubeId,
          setYoutubeStart,
          setHasTwitterEmbed,
          setTweetId,
          setHasInstagramEmbed,
          setHasTikTokEmbed,
          setHasImage,
        );

        // set author to the URL
        setAuthor(res.metadata.author);

        // search for related entries
        handleSearch(res.data, res.id);
      };
      asyncFn();
    }
  }, [pathname, data]);

  return (
    <div className="my-4">
      {hasYouTubeEmbed && (
        <LiteYouTubeEmbed
          id={youtubeId}
          params={`start=${youtubeStart}`}
          title="YouTube video"
        />
      )}
      {hasImage && (
        <Image
          className="h-auto w-full"
          src={author}
          alt="Image"
          layout="responsive"
          width={700} // Adjust width as needed
          height={475} // Adjust height as needed
        />
      )}
      {hasTwitterEmbed && <Tweet id={tweetId} />}
      {hasInstagramEmbed && <MemoizedInstagramEmbed url={author} />}
      {hasTikTokEmbed && <MemoizedTikTokEmbed url={author} />}

      {data ? (
        <div>
          <h2 className="my-4 text-4xl font-extrabold">Data</h2>
          <p className="my-4 text-lg text-gray-500">{data.data}</p>
          <h2 className="my-4 text-4xl font-extrabold">Metadata</h2>
          <h3 className="my-4 text-2xl font-bold">Title</h3>
          <p className="my-4 text-lg text-gray-500">{data.metadata.title}</p>
          <h3 className="my-4 text-2xl font-bold">URL</h3>
          <Link
            href={data.metadata.author}
            className=" text-blue-600 hover:underline"
            target="_blank"
          >
            {data.metadata.author}{' '}
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
          </Link>
          <h3 className="my-4 text-2xl font-bold">Created At</h3>
          <a
            href={`/dashboard/garden?date=${new Date(data.createdAt)
              .toLocaleDateString()
              .split('/')
              .map((d) => (d.length === 1 ? `0${d}` : d))
              .join('-')}
                `}
            className="text-blue-600 hover:underline"
          >
            {new Date(data.createdAt).toLocaleDateString()}
          </a>
        </div>
      ) : (
        'Loading...'
      )}

      {hasAliases && (
        <div>
          <h2 className="my-4 text-4xl font-extrabold">Aliases</h2>
          {data?.metadata?.aliasData?.map((alias: any) => (
            <div key={alias.aliasId} className="mb-4">
              <p>{alias.aliasData}</p>
              <p className="text-sm text-gray-500">
                Created at: {alias.aliasCreatedAt}
              </p>
            </div>
          ))}
        </div>
      )}

      <h2 className="my-4 text-4xl font-extrabold">Add Alias</h2>
      <div className="">
        <input
          type="text"
          className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Add an alias..."
          onKeyDown={async (e) => {
            if (e.key === 'Enter') {
              const aliasInput = document.getElementById(
                `alias-input-${data?.id}`,
              );
              if (!aliasInput) return;
              // Cast to HTMLInputElement to access value property
              const alias = (aliasInput as HTMLInputElement).value;
              setIsAddingAlias(true);
              await handleAliasAdd({
                id: data?.id,
                alias,
                data,
                metadata: {
                  title: data?.metadata.title,
                  author: data?.metadata.author,
                  links: data?.metadata.links,
                },
              });
              setIsAddingAlias(false);
              // clear input field
              (aliasInput as HTMLInputElement).value = '';
              // setProcessingAliases((prev) => {
              //   return [...prev, alias];
              // });
            }
          }}
          id={`alias-input-${data?.id}`}
        />
        {!isAddingAlias ? (
          <button
            type="button"
            onClick={async () => {
              const aliasInput = document.getElementById(
                `alias-input-${data?.id}`,
              );
              if (!aliasInput) return;
              // Cast to HTMLInputElement to access value property
              const alias = (aliasInput as HTMLInputElement).value;
              setIsAddingAlias(true);
              await handleAliasAdd({
                id: data?.id,
                alias,
                data,
                metadata: {
                  title: data?.metadata.title,
                  author: data?.metadata.author,
                  links: data?.metadata.links,
                },
              });
              setIsAddingAlias(false);
              // clear input field
              (aliasInput as HTMLInputElement).value = '';
              // add alias to span list to show users new aliases
              // setProcessingAliases((prev) => {
              //   return [...prev, alias];
              // });
            }}
            className="mb-2 me-2 mt-4 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-gray-300"
            aria-label="Add alias"
          >
            Add Alias (or press enter)
          </button>
        ) : (
          <button disabled type="button" className="ml-2" aria-label="adding">
            <svg
              aria-hidden="true"
              role="status"
              className="me-3 inline size-4 animate-spin text-white"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="#E5E7EB"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentColor"
              />
            </svg>
          </button>
        )}
      </div>

      <h2 className="my-4 text-4xl font-extrabold">Related Entries</h2>

      {searchResults.map((result) => (
        <div key={result.id} className="mb-4">
          <Link
            href={{
              pathname: `/dashboard/entry/${result.id}`,
            }}
            className="block"
          >
            <div className="flex items-center text-blue-600 hover:underline">
              <Image
                src={result.favicon}
                alt="favicon"
                width={16}
                height={16}
                className="mr-2"
              />
              <span className="font-medium">
                {result.data.length > 50 ? (
                  <>
                    {result.data.slice(0, 50)}...
                    <span className="mt-1 block text-sm text-gray-500">
                      ...{result.data.slice(50)}
                    </span>
                  </>
                ) : (
                  result.data
                )}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {result.parentData && (
                <span className="mt-1 block">{result.parentData.data}</span>
              )}
            </div>
          </Link>
        </div>
      ))}

      <Link
        href="/dashboard"
        className="mt-4 block text-blue-600 hover:underline"
      >
        Back to dashboard
      </Link>
    </div>
  );
};

export default EntryPage;
