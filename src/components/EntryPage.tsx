/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/img-redundant-alt */

// EntryPage.tsx

'use client';

import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useEffect, useState } from 'react';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import ReactMarkdown from 'react-markdown';
import { InstagramEmbed, TikTokEmbed } from 'react-social-media-embed';
import { Spotify } from 'react-spotify-embed';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Tweet } from 'react-tweet';
import { v4 as uuidv4 } from 'uuid';

import {
  createAmalgam,
  deleteEntry as apiDeleteEntry,
  fetchByID,
  fetchSearchEntries,
  fetchSearchEntriesHelper,
  formatDate,
  splitIntoWords,
  updateEntry as apiUpdateEntry,
} from '../helpers/functions';
import { createEntryTransaction } from '../helpers/transactionFunctions';
import type { Transaction } from '../helpers/transactionManager';
import { TransactionManager } from '../helpers/transactionManager';
import EditModal from './EditModal';
import LinksModal from './LinksModal';
import Loading from './Loading';
import SearchModalBeta from './SearchModalBeta';
import UrlSVG from './UrlSVG';

const EntryPage = () => {
  // fetch data from the server at id on load
  const [data, setData] = useState<{
    data: any;
    metadata: any;
    id: string;
    createdAt: string;
  } | null>(null);
  const [author, setAuthor] = useState(''); // author is the URL
  const pathname = usePathname();
  const [hasYouTubeEmbed, setHasYoutubeEmbed] = useState(false);
  const [youtubeId, setYoutubeId] = useState('');
  const [youtubeStart, setYoutubeStart] = useState(0);
  const [tweetId, setTweetId] = useState('');
  const [hasTwitterEmbed, setHasTwitterEmbed] = useState(false);
  const [hasCodeBlock, setHasCodeBlock] = useState(false);
  const [hasInstagramEmbed, setHasInstagramEmbed] = useState(false);
  const [hasTikTokEmbed, setHasTikTokEmbed] = useState(false);
  const [hasImage, setHasImage] = useState(false);
  const [hasSpotifyEmbed, setHasSpotifyEmbed] = useState(false);
  const MemoizedTikTokEmbed = memo(TikTokEmbed);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  // const router = useRouter();
  const [showAliasError] = useState(false);
  const { user, isLoaded } = useUser();
  const [firstLastName, setFirstLastName] = useState({
    firstName: '',
    lastName: '',
  });
  const [showDeleteError] = useState(false);

  const [modalStates, setModalStates] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [relatedText] = useState('Related Entries');

  const [searchBetaModalQuery, setSearchBetaModalQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [transactionManager, setTransactionManager] =
    useState<TransactionManager | null>(null);
  const [tempIds, setTempIds] = useState<string[]>([]);
  const [tempCommentIDs, setTempCommentIDs] = useState<any[]>([]);

  const openModal = (key: string) =>
    setModalStates((prev) => ({ ...prev, [key]: true }));
  const closeModal = (key: string) =>
    setModalStates((prev) => ({ ...prev, [key]: false }));

  const toHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch (err) {
      return url;
    }
  };

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

  const checkEmbeds = (
    res: { data: any; metadata: any },
    fn_setHasYoutubeEmbed: React.Dispatch<React.SetStateAction<boolean>>,
    fn_setYoutubeId: React.Dispatch<React.SetStateAction<string>>,
    fn_setYoutubeStart: React.Dispatch<React.SetStateAction<number>>,
    fn_setHasTwitterEmbed: React.Dispatch<React.SetStateAction<boolean>>,
    fn_setTweetId: React.Dispatch<React.SetStateAction<string>>,
    fn_setHasInstagramEmbed: React.Dispatch<React.SetStateAction<boolean>>,
    fn_setHasTikTokEmbed: React.Dispatch<React.SetStateAction<boolean>>,
    fn_setHasImage: React.Dispatch<React.SetStateAction<boolean>>,
    fn_setHasSpotifyEmbed: React.Dispatch<React.SetStateAction<boolean>>,
    fn_setHasCodeBlock: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
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
    // check if the data has spotify embed
    if (res.metadata.author.includes('open.spotify.com')) {
      fn_setHasSpotifyEmbed(true);
    }
    // check if the data has code block
    if (res.metadata.code) {
      fn_setHasCodeBlock(true);
      // replace ```*``` in data.data with ''
      res.data = res.data.replace(/```[\s\S]*?```/g, '');
    }
  };

  const handleSearchHelper = async (entryData: string) => {
    const parsedEntries = await fetchSearchEntries(
      entryData,
      setSearchResults,
      null,
    );
    return parsedEntries;
  };

  const handleSearchLinksModal = async (entryData: string) => {
    const parsedEntries = await fetchSearchEntriesHelper(entryData);
    return parsedEntries;
  };

  const handleSearch = async (entryData: string, _: string) => {
    const parsedEntries = await handleSearchHelper(entryData);
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
        let dt;

        try {
          dt = await fetchByID(entryId);
        } catch (error: any) {
          if (error.message.includes('No data returned from the API')) {
            // remove current page from the history stack so user doesnt back to it for loop
            window.history.pushState({}, '', window.location.pathname);
            // Redirect to a 404 page
            window.location.href = '/404';
          }
          // Handle other errors
          console.error('An error occurred:', error);
          throw error;
        }

        if ('parent_id' in dt.metadata) {
          const parentData = await fetchByID(dt.metadata.parent_id);
          // set res to parentData
          res = parentData;
        }
        // set res to dt if parentData is not available
        res = res || dt;

        if ('alias_ids' in res.metadata) {
          // fetch plaintext data from alias_ids
          const aliasData = await Promise.all(
            res.metadata.alias_ids.map((aliasId: string) => fetchByID(aliasId)),
          );
          // replace alias_ids with aliasData
          res.metadata.aliasData = aliasData
            .map((ad) => {
              return {
                aliasData: ad.data,
                aliasId: ad.id,
                aliasCreatedAt: formatDate(ad.createdAt),
                aliasUpdatedAt: formatDate(ad.updatedAt),
                aliasMetadata: ad.metadata,
              };
            })
            .reverse();
        }

        setData({
          data: res.data,
          metadata: res.metadata,
          id: res.id,
          createdAt: res.createdAt,
        });

        // Initialize the TransactionManager with the current data
        setTransactionManager(new TransactionManager(res));

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
          setHasSpotifyEmbed,
          setHasCodeBlock,
        );

        // set author to the URL
        setAuthor(res.metadata.author);

        // search for related entries
        handleSearch(res.data, res.id);
        if (res) {
          const amalgam = await createAmalgam(
            res,
            res.metadata.aliasData,
            [],
            [],
            {
              disableAliasKeysInMetadata: true,
              disableAliasKeysInComments: true,
            },
          );
          console.log('Amalgam:', amalgam);
        }
      };
      asyncFn();
    }
  }, [pathname, data]);

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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k') {
        const selectedText = window.getSelection()?.toString();
        if (selectedText) {
          // open search modal beta
          setModalStates((prev) => ({ ...prev, searchModalBeta: true }));
          setSearchBetaModalQuery(selectedText);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (data) {
      document.title = data.data;
    }
  }, [data]);

  // Transaction Handlers

  // Handle Edit Entry
  const handleEditEntry = (newData: string, newMetadata: any) => {
    if (!transactionManager || !data) return;

    console.log('newMetadata:', newMetadata);

    // Update the draft state
    const draftState = transactionManager.getDraftState();
    draftState.data = newData;
    draftState.metadata = newMetadata;

    // Update UI immediately
    setData({ ...draftState });

    // Add transaction
    const editEntryTx: Transaction = async () => {
      await apiUpdateEntry(data.id, newData, newMetadata);
    };

    // should happen last
    transactionManager.addTransaction(editEntryTx, { dependencies: tempIds });
  };

  // Handle Delete Entry
  const handleDeleteEntry = () => {
    if (!transactionManager || !data) return;

    // Confirm deletion
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this entry?',
    );
    if (!confirmDelete) return;

    // Update the draft state
    const draftState = transactionManager.getDraftState();
    draftState.deleted = true;

    // Update UI immediately (navigate back to dashboard)
    // router.push('/dashboard');

    // Add transaction
    const deleteEntryTx: Transaction = async () => {
      await apiDeleteEntry(data.id);
    };

    transactionManager.addTransaction(deleteEntryTx);
  };

  // Handle Add Comment
  const handleAddComment = (aliasInput: string) => {
    if (!transactionManager || !data) return;
    console.log('alias:', aliasInput);

    // Assign a temporary ID
    const tempAliasId = `temp-${uuidv4()}`;

    // Update the draft state
    const draftState = transactionManager.getDraftState();
    const newAliasData = {
      aliasId: tempAliasId,
      aliasData: aliasInput,
      aliasCreatedAt: new Date().toISOString(),
      aliasUpdatedAt: new Date().toISOString(),
      aliasMetadata: {
        title: data.metadata.title,
        author: data.metadata.author,
        parent_id: data.id,
      },
    };
    draftState.metadata.aliasData = [
      newAliasData,
      ...(draftState.metadata.aliasData || []),
    ];
    draftState.metadata.alias_ids = [...(draftState.metadata.alias_ids || [])];

    // Update UI immediately
    setData({ ...draftState });

    // Transaction to create the alias entry
    // const createAliasTx = createEntryTransaction(tempAliasId, alias, {
    //   parent_id: data.id,
    //   title: data.metadata.title,
    //   author: data.metadata.author,
    // });

    // const updateParentTx: Transaction = async (
    //   context: any,
    // ) => {
    //   const actualAliasId = context.idMapping.get(tempAliasId);
    //   if (!actualAliasId) {
    //     throw new Error(`Failed to resolve ID for temporary ID ${tempAliasId}`);
    //   }
    //   // remove the temporary alias ID from the alias_ids array
    //   const updatedAliasIds = [
    //     actualAliasId,
    //     ...(data.metadata.alias_ids.filter(
    //       (id: string) => id !== tempAliasId,
    //     ) || []),
    //   ];
    //   console.log('updatedAliasIds:', updatedAliasIds);

    //   // remove aliasData from metadata
    //   delete data.metadata.aliasData;

    //   await apiUpdateEntry(data.id, data.data, {
    //     ...data.metadata,
    //     alias_ids: updatedAliasIds,
    //   });
    // };

    // Add transactions with dependencies
    // transactionManager.addTransaction(createAliasTx, { tempId: tempAliasId });
    // add the tempAliasId to the tempCommentIDs array
    setTempCommentIDs((prev) => [...prev, { tempAliasId, aliasInput }]);
    // transactionManager.addTransaction(updateParentTx, {
    //   dependencies: [tempAliasId],
    // });
  };

  const handleSaveComments = async () => {
    if (!transactionManager || !data) return;

    // for each tempCommentIDs add a transaction
    for (const tempCommentId of tempCommentIDs) {
      const { tempAliasId, aliasInput } = tempCommentId;
      console.log('tempCommentId and aliasInput:', { tempAliasId, aliasInput });
      transactionManager.addTransaction(
        createEntryTransaction(tempAliasId, aliasInput, {
          parent_id: data.id,
          title: data.metadata.title,
          author: data.metadata.author,
        }),
        {
          tempId: tempAliasId,
        },
      );
    }

    // Transaction to update the parent entry with the new alias ID
    const updateParentTx: Transaction = async (context: any) => {
      const actualAliasIds = tempCommentIDs.map((tempComment) => {
        const actualAliasId = context.idMapping.get(tempComment.tempAliasId);
        if (!actualAliasId) {
          throw new Error(
            `Failed to resolve ID for temporary ID ${tempComment.tempAliasId}`,
          );
        }
        return actualAliasId;
      });

      // remove the temporary alias IDs from the alias_ids array
      const updatedAliasIds = [
        ...actualAliasIds,
        ...(data.metadata.alias_ids.filter(
          (id: string) => !tempCommentIDs.includes(id),
        ) || []),
      ];
      console.log('updatedAliasIds:', updatedAliasIds);

      // remove aliasData from metadata
      delete data.metadata.aliasData;

      await apiUpdateEntry(data.id, data.data, {
        ...data.metadata,
        alias_ids: updatedAliasIds,
      });
    };

    transactionManager.addTransaction(updateParentTx, {
      dependencies: tempCommentIDs,
    });
  };

  // Handle Delete Comment
  const handleDeleteComment = (aliasId: string) => {
    if (!transactionManager || !data) return;

    // Confirm deletion
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this comment?',
    );
    if (!confirmDelete) return;

    // Update the draft state
    const draftState = transactionManager.getDraftState();
    draftState.metadata.aliasData = draftState.metadata.aliasData.filter(
      (alias: any) => alias.aliasId !== aliasId,
    );
    draftState.metadata.alias_ids = (
      draftState.metadata.alias_ids || []
    ).filter((id: string) => id !== aliasId);

    // Update UI immediately
    setData({ ...draftState });

    if (
      tempCommentIDs.find(
        (tempCommentId) => tempCommentId.tempAliasId === aliasId,
      )
    ) {
      // if temp id is being deleted remove the transactions from the tempCommentIDs array
      setTempCommentIDs((prev) =>
        prev.filter((tempCommentId) => tempCommentId.tempAliasId !== aliasId),
      );
    } else {
      const deleteCommentTxName = `deleteCommentTx-${uuidv4()}`;
      const updateParentTxName = `updateParentTx-${uuidv4()}`;

      // Add transaction to delete the comment
      const deleteCommentTx: Transaction = async () => {
        await apiDeleteEntry(aliasId);
      };

      // Add transaction to update the parent entry
      const updateParentTx: Transaction = async () => {
        await apiUpdateEntry(data.id, data.data, draftState.metadata);
      };
      transactionManager.addTransaction(deleteCommentTx, {
        name: deleteCommentTxName,
      });
      transactionManager.addTransaction(updateParentTx, {
        name: updateParentTxName,
      });
    }
  };

  // Handle Edit Comment
  const handleEditComment = (aliasId: string, newAliasData: string) => {
    if (!transactionManager || !data) return;

    // Update the draft state
    const draftState = transactionManager.getDraftState();
    const aliasIndex = draftState.metadata.aliasData.findIndex(
      (alias: any) => alias.aliasId === aliasId,
    );
    if (aliasIndex !== -1) {
      draftState.metadata.aliasData[aliasIndex].aliasData = newAliasData;
    }

    // Update UI immediately
    setData({ ...draftState });

    // if editing a comment with a temp id change it in place
    if (
      tempCommentIDs.find(
        (tempCommentId) => tempCommentId.tempAliasId === aliasId,
      )
    ) {
      setTempCommentIDs((prev) =>
        prev.map((tempCommentId) =>
          tempCommentId.tempAliasId === aliasId
            ? { ...tempCommentId, aliasInput: newAliasData }
            : tempCommentId,
        ),
      );
    } else {
      // Add transaction to update the comment

      const editCommentTxName = `editCommentTx-${uuidv4()}`;

      const editCommentTx: Transaction = async () => {
        // same metadata as it was before
        await apiUpdateEntry(aliasId, newAliasData, {
          title: data.metadata.title,
          author: data.metadata.author,
          parent_id: data.id,
        });
      };

      transactionManager.addTransaction(editCommentTx, {
        name: editCommentTxName,
      });
    }
  };

  // Handle Add Link
  const handleAddLink = (name: string, url: string) => {
    if (!transactionManager || !data) return;

    // Update the draft state
    const draftState = transactionManager.getDraftState();
    const newLink = { name, url };
    draftState.metadata.links = [...(draftState.metadata.links || []), newLink];

    // Update UI immediately
    setData({ ...draftState });

    const addLinkTxName = `addLinkTx-${uuidv4()}`;

    // Add transaction to update the entry
    const addLinkTx: Transaction = async () => {
      await apiUpdateEntry(data.id, data.data, draftState.metadata);
    };

    // add the new link to the tempIds array
    setTempIds((prev) => [...prev, newLink.name]);

    transactionManager.addTransaction(addLinkTx, {
      name: addLinkTxName,
    });
  };

  // Handle Delete Link
  const handleDeleteLink = (index: number) => {
    if (!transactionManager || !data) return;

    // Update the draft state
    const draftState = transactionManager.getDraftState();
    if (draftState.metadata.links && draftState.metadata.links[index]) {
      draftState.metadata.links.splice(index, 1);
    }

    // Update UI immediately
    setData({ ...draftState });

    // Add transaction to update the entry
    const deleteLinkTx: Transaction = async () => {
      await apiUpdateEntry(data.id, data.data, draftState.metadata);
    };

    // add the new link to the tempIds array
    const tempDeleteLinkId = `temp-delete-link-${uuidv4()}`;
    setTempIds((prev) => [...prev, tempDeleteLinkId]);

    transactionManager.addTransaction(deleteLinkTx);
  };

  // Handle Save All Transactions
  const handleSaveAll = async () => {
    if (!transactionManager) return;

    try {
      setIsSaving(true);
      handleSaveComments();

      await transactionManager.executeTransactions();
      // Update the data with the latest draft state
      setData(transactionManager.getDraftState());
      setIsSaving(false);
      alert('All changes saved successfully.');
      // reload the page
      window.location.reload();
    } catch (error) {
      alert('Failed to save changes. Rolling back to the last saved state.');
      // Rollback UI to last saved state
      setData(transactionManager.getDraftState());
      console.error(transactionManager.getErrorLog());
      setIsSaving(false);
    }
  };

  // Rendered Data
  const renderedData = transactionManager
    ? transactionManager.getDraftState()
    : data;

  return renderedData ? (
    <div className="my-4 min-w-full max-w-full">
      {hasYouTubeEmbed && (
        <LiteYouTubeEmbed
          id={youtubeId}
          params={`start=${youtubeStart}`}
          title="YouTube video"
        />
      )}
      {hasImage && <img className="h-auto w-full" src={author} alt="Image" />}
      {hasTwitterEmbed && <Tweet id={tweetId} />}
      {hasSpotifyEmbed && <Spotify link={author} wide />}
      {hasInstagramEmbed && <InstagramEmbed url={author} />}
      {hasTikTokEmbed && <MemoizedTikTokEmbed url={author} />}
      {hasCodeBlock && data && (
        <SyntaxHighlighter
          language={
            data.metadata.language === 'typescriptreact'
              ? 'tsx'
              : data.metadata.language
          }
          style={docco}
          wrapLines
          wrapLongLines
        >
          {data.metadata.code}
        </SyntaxHighlighter>
      )}

      {data ? (
        <div className="m-4 [&_p]:my-6">
          <ReactMarkdown className="font-normal text-gray-900">
            {renderedData.data}
          </ReactMarkdown>

          <EditModal
            isOpen={modalStates.editModal || false}
            closeModalFn={() => closeModal('editModal')}
            data={renderedData.data}
            id={renderedData.id}
            disabledKeys={['aliasData', 'alias_ids', 'links', 'parent_id']}
            metadata={renderedData.metadata}
            onSave={handleEditEntry}
          />
          <SearchModalBeta
            isOpen={modalStates.searchModalBeta || false}
            closeModalFn={() => closeModal('searchModalBeta')}
            inputQuery={searchBetaModalQuery}
          />
          <Link
            href={renderedData.metadata.author}
            className=" inline-flex items-center overflow-auto font-medium text-blue-600 hover:underline"
            target="_blank"
          >
            {renderedData.metadata.title}
            <UrlSVG />
          </Link>
          <button
            type="button"
            onClick={() => openModal('editModal')}
            className="my-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4"
          >
            Edit Entry
          </button>
          <button
            type="button"
            onClick={handleDeleteEntry}
            className="my-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4"
          >
            Delete Entry
          </button>
          {showDeleteError && (
            <div className="text-red-500">
              Error deleting entry, delete comments first if you want to delete
              the entry.
            </div>
          )}

          <h3 className="my-4 text-2xl font-bold">Added to yCb</h3>
          <a
            href={`/dashboard/garden?date=${new Date(renderedData.createdAt)
              .toLocaleDateString()
              .split('/')
              .map((d) => (d.length === 1 ? `0${d}` : d))
              .join('-')}
                `}
            className="text-blue-600 hover:underline"
          >
            {new Date(renderedData.createdAt).toLocaleDateString()}
          </a>
        </div>
      ) : (
        'Loading...'
      )}

      <button
        type="button"
        onClick={handleSaveAll}
        className="my-2 w-full rounded-lg bg-green-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 focus:outline-none"
      >
        {isSaving ? 'Saving...' : 'Save All Changes'}
      </button>

      <h2 className="my-4 text-4xl font-extrabold">Add Comment</h2>
      <div className="">
        <textarea
          rows={3}
          style={{ fontSize: '17px' }}
          className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Add a comment..."
          id={`alias-input-${renderedData?.id}`}
        />
        <button
          type="button"
          onClick={() => {
            const aliasInput = document.getElementById(
              `alias-input-${renderedData?.id}`,
            );
            if (!aliasInput) return;
            // Cast to HTMLInputElement to access value property
            const alias = (aliasInput as HTMLInputElement).value;
            handleAddComment(alias);
            // clear input field
            (aliasInput as HTMLInputElement).value = '';
          }}
          className="mb-2 me-2 mt-4 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-gray-300"
          aria-label="Add alias"
        >
          Add Comment
        </button>
      </div>

      {renderedData.metadata.aliasData &&
        renderedData.metadata.aliasData.length > 0 && (
          <h2 className="my-4 text-4xl font-extrabold">Comments</h2>
        )}

      <div>
        {renderedData?.metadata?.aliasData?.map((alias: any) => (
          <div key={alias.aliasId} className="mb-4 flex flex-col items-start">
            <EditModal
              isOpen={modalStates[`alias-${alias.aliasId}`] || false}
              closeModalFn={() => closeModal(`alias-${alias.aliasId}`)}
              data={alias.aliasData}
              id={alias.aliasId}
              metadata={alias.aliasMetadata}
              disabledKeys={['parent_id']}
              onSave={(newData) => handleEditComment(alias.aliasId, newData)}
            />
            <div className="flex">
              <div className="mr-2 flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-300 text-xs font-bold text-white">
                {firstLastName.firstName && firstLastName.lastName ? (
                  <>
                    {firstLastName.firstName[0]}
                    {firstLastName.lastName[0]}
                  </>
                ) : (
                  'YCB'
                )}
              </div>
              <p className="text-black">{alias.aliasData}</p>
            </div>
            <p className="text-sm text-gray-500">
              Added to yCb: {alias.aliasCreatedAt}
            </p>
            <div className="flex">
              <button
                className="mr-4 justify-start text-blue-600 hover:underline"
                type="button"
                onClick={() => {
                  setModalStates((prev) => ({
                    ...prev,
                    searchModalBeta: true,
                  }));
                  setSearchBetaModalQuery(alias.aliasData);
                }}
              >
                Search
              </button>
              <button
                className="mr-4 justify-start text-blue-600 hover:underline"
                type="button"
                onClick={() => openModal(`alias-${alias.aliasId}`)}
                aria-label="edit"
              >
                Edit
              </button>
              <button
                className="justify-start text-blue-600 hover:underline"
                type="button"
                onClick={() => handleDeleteComment(alias.aliasId)}
                aria-label="delete"
              >
                Delete Comment
              </button>
            </div>
            <hr className="mt-2 w-full" />
          </div>
        ))}
      </div>

      {showAliasError && (
        <div className="text-red-500">Error adding alias. Try again.</div>
      )}

      <h2 className="my-4 text-4xl font-extrabold">Add Links</h2>

      <button
        type="button"
        className="my-4 w-full rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
        onClick={() => setIsLinkModalOpen(true)}
      >
        Add Link
      </button>
      {isLinkModalOpen && (
        <LinksModal
          isOpen={isLinkModalOpen}
          closeModalFn={() => setIsLinkModalOpen(false)}
          onSave={(name, url) => {
            handleAddLink(name, url);
            setIsLinkModalOpen(false);
          }}
          onSearch={handleSearchLinksModal}
        />
      )}

      {renderedData.metadata.links &&
        renderedData.metadata.links.length > 0 && (
          <>
            <h2 className="my-4 text-4xl font-extrabold">Links</h2>
            <div>
              {renderedData.metadata.links.map((link: any, index: number) => (
                <div
                  key={`${link.name}-${uuidv4()}`}
                  className="flex items-center"
                >
                  <Link
                    href={link.url}
                    target="_blank"
                    className="text-blue-600 hover:underline"
                  >
                    {link.name}
                  </Link>
                  <button
                    type="button"
                    className="ml-2 text-red-500 hover:underline"
                    onClick={() => handleDeleteLink(index)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

      <h2 className="my-4 text-4xl font-extrabold">{relatedText}</h2>
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
          </div>
          <hr className="my-4" />
        </div>
      ))}

      <Link
        href="/dashboard"
        className="mt-4 block text-blue-600 hover:underline"
      >
        Back to dashboard
      </Link>
    </div>
  ) : (
    <Loading />
  );
};

export default EntryPage;
