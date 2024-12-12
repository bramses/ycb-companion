/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/img-redundant-alt */

// EntryPage.tsx

'use client';

import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

import { useUser } from '@clerk/nextjs';
// import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useEffect, useState } from 'react';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import { InstagramEmbed, TikTokEmbed } from 'react-social-media-embed';
import { Spotify } from 'react-spotify-embed';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Tweet } from 'react-tweet';
import { v4 as uuidv4 } from 'uuid';

import {
  addEntry,
  // createAmalgam,
  deleteEntry as apiDeleteEntry,
  fetchByID,
  // fetchSearchEntries,
  fetchSearchEntriesHelper,
  formatDate,
  // splitIntoWords,
  updateEntry as apiUpdateEntry,
} from '../helpers/functions';
import { createEntryTransaction } from '../helpers/transactionFunctions';
import type { Transaction } from '../helpers/transactionManager';
import { TransactionManager } from '../helpers/transactionManager';
import Chat from './Chat';
import EditModal from './EditModal';
import ForceDirectedGraph from './ForceDirectedGraph';
// import LinksModal from './LinksModal';
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
  const [hasR2Dev, setHasR2Dev] = useState(false);
  const MemoizedTikTokEmbed = memo(TikTokEmbed);
  // const [searchResults, setSearchResults] = useState<any[]>([]);
  // const router = useRouter();
  const [showAliasError] = useState(false);
  const { user, isLoaded } = useUser();
  const [firstLastName, setFirstLastName] = useState({
    firstName: '',
    lastName: '',
  });
  const [showDeleteError] = useState(false);
  // const [uniqueRelationships, setUniqueRelationships] = useState<any>(
  //   new Set(),
  // );

  const [modalStates, setModalStates] = useState<{ [key: string]: boolean }>(
    {},
  );
  // todo: implement image upload
  // const [isImageUploading, setIsImageUploading] = useState(false);
  // const apiKey = process.env.NEXT_PUBLIC_API_KEY_CF_IMG;
  // const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  // const [relatedText] = useState('Related Entries');

  const [searchBetaModalQuery, setSearchBetaModalQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [transactionManager, setTransactionManager] =
    useState<TransactionManager | null>(null);
  const [tempIds, setTempIds] = useState<string[]>([]);
  const [tempCommentIDs, setTempCommentIDs] = useState<any[]>([]);
  const [cachedFData, setCachedFData] = useState<any>(null);
  const [isInDraftState, setIsInDraftState] = useState(false);

  const openModal = (key: string) =>
    setModalStates((prev) => ({ ...prev, [key]: true }));
  const closeModal = (key: string) =>
    setModalStates((prev) => ({ ...prev, [key]: false }));

  // const toHostname = (url: string) => {
  //   try {
  //     return new URL(url).hostname;
  //   } catch (err) {
  //     return url;
  //   }
  // };

  // const renderResultData = (result: any) => {
  //   if (
  //     result.metadata &&
  //     result.metadata.author &&
  //     result.metadata.author.includes('imagedelivery.net')
  //   ) {
  //     return <img src={result.metadata.author} alt="Image" />;
  //   }

  //   if (result.metadata && result.metadata.code) {
  //     return (
  //       <SyntaxHighlighter
  //         language={
  //           result.metadata.language === 'typescriptreact'
  //             ? 'tsx'
  //             : result.metadata.language
  //         }
  //         style={docco}
  //         wrapLines
  //         wrapLongLines
  //         customStyle={{ height: '200px', overflow: 'scroll' }}
  //       >
  //         {result.metadata.code}
  //       </SyntaxHighlighter>
  //     );
  //   }

  //   if (result.parentData) {
  //     return result.parentData.data;
  //   }
  //   if (result.data.split(' ').length > 2200) {
  //     return (
  //       <>
  //         {splitIntoWords(result.data, 22, 0)}...
  //         <span className="mt-1 block text-sm text-gray-500">
  //           ...{splitIntoWords(result.data, 22, 22)}...
  //         </span>
  //       </>
  //     );
  //   }
  //   return result.data;
  // };

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
    fn_setHasR2Dev: React.Dispatch<React.SetStateAction<boolean>>,
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

    // check if the data has r2dev embed
    if (res.metadata.author.includes('r2.dev')) {
      fn_setHasR2Dev(true);
    }
  };

  // const handleSearchHelper = async (entryData: string) => {
  //   const parsedEntries = await fetchSearchEntries(
  //     entryData,
  //     setSearchResults,
  //     null,
  //   );
  //   return parsedEntries;
  // };

  const handleSearchLinksModal = async (entryData: string) => {
    const parsedEntries = await fetchSearchEntriesHelper(entryData);
    return parsedEntries;
  };

  // const handleSearch = async (entryData: string, _: string) => {
  //   const parsedEntries = await handleSearchHelper(entryData);
  //   // add ids of parsed entries to uniqueRelationships
  //   // parsedEntries.forEach((entry: any) => {
  //   //   const { id } = entry;
  //   //   if (id) {
  //   //     setUniqueRelationships((prev: any) => new Set([...prev, id]));
  //   //   }
  //   //   // console.log('uniqueRelationships:', uniqueRelationships);
  //   // });
  //   setSearchResults(parsedEntries);
  // };

  // useEffect(() => {
  //   if (data?.metadata?.aliasData) {
  //     data.metadata.aliasData.forEach(async (alias: any) => {
  //       const parsedEntries = await handleSearchHelper(alias.aliasData);
  //       parsedEntries.forEach((entry: any) => {
  //         const { id } = entry;
  //         if (id) {
  //           setUniqueRelationships((prev: any) => new Set([...prev, id]));
  //         }
  //       });
  //     });
  //   }
  // }, [data?.metadata?.aliasData]);

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
          console.error(error);
          console.error('An error occurred in fetching entry:', error);
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
          setHasR2Dev,
        );

        // set author to the URL
        setAuthor(res.metadata.author);

        // search for related entries
        // handleSearch(res.data, res.id);
        // if (res) {
        //   const amalgam = await createAmalgam(
        //     res,
        //     res.metadata.aliasData,
        //     [],
        //     [],
        //     {
        //       disableAliasKeysInMetadata: true,
        //       disableAliasKeysInComments: true,
        //     },
        //   );
        //   console.log('Amalgam:', amalgam);
        // }
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
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isInDraftState) {
        event.preventDefault();
        return 'leaving the page will discard your changes';
      }
      console.log('not in draft state');
      return null;
    };

    const handlePopState = (event: PopStateEvent) => {
      if (isInDraftState) {
        const confirmationMessage =
          'leaving the page will discard your changes';
        if (!window.confirm(confirmationMessage)) {
          event.preventDefault();
          window.history.pushState(null, '', window.location.href);
        }
      }
    };

    const handleLinkClick = (event: MouseEvent) => {
      if (isInDraftState) {
        const target = event.target as HTMLAnchorElement;
        if (target.tagName === 'A' && target.href) {
          const confirmationMessage =
            'leaving the page will discard your changes';
          if (!window.confirm(confirmationMessage)) {
            event.preventDefault();
          }
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('click', handleLinkClick);

    console.log(
      'Added event listeners for beforeunload, popstate, and link clicks',
    );

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleLinkClick);
      console.log(
        'Removed event listeners for beforeunload, popstate, and link clicks',
      );
    };
  }, [isInDraftState]);

  // useEffect(() => {
  //   const handleKeyDown = (event: KeyboardEvent) => {
  //     if (event.key === 'k') {
  //       const selectedText = window.getSelection()?.toString();
  //       if (selectedText) {
  //         // open search modal beta
  //         setModalStates((prev) => ({ ...prev, searchModalBeta: true }));
  //         setSearchBetaModalQuery(selectedText);
  //       }
  //     }
  //   };

  //   window.addEventListener('keydown', handleKeyDown);

  //   return () => {
  //     window.removeEventListener('keydown', handleKeyDown);
  //   };
  // }, []);

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
    setIsInDraftState(true);
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

    setIsInDraftState(true);

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
    setIsInDraftState(true);
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

  // todo: implement image upload
  // const handleImageUploadComment = async (input: any, imageUrl: any) => {
  //   if (!transactionManager || !data) return;
  //   console.log('input:', input);
  //   console.log('imageUrl:', imageUrl);
  //   // Assign a temporary ID
  //   const tempAliasId = `temp-${uuidv4()}`;

  //   // Update the draft state
  //   const draftState = transactionManager.getDraftState();
  //   const newAliasData = {
  //     aliasId: tempAliasId,
  //     aliasData: input,
  //     aliasCreatedAt: new Date().toISOString(),
  //     aliasUpdatedAt: new Date().toISOString(),
  //     aliasMetadata: {
  //       title: 'Image',
  //       author: imageUrl,
  //       parent_id: data.id,
  //     },
  //   };
  //   draftState.metadata.aliasData = [
  //     newAliasData,
  //     ...(draftState.metadata.aliasData || []),
  //   ];
  //   draftState.metadata.alias_ids = [...(draftState.metadata.alias_ids || [])];

  //   // Update UI immediately
  //   setIsInDraftState(true);
  //   setData({ ...draftState });

  //   setTempCommentIDs((prev) => [
  //     ...prev,
  //     { tempAliasId, aliasInput: input, aliasImageUrl: imageUrl },
  //   ]);
  // };

  const handleSaveComments = async () => {
    if (!transactionManager || !data) return;

    // for each tempCommentIDs add a transaction
    for (const tempCommentId of tempCommentIDs) {
      const { tempAliasId, aliasInput, aliasImageUrl } = tempCommentId;
      console.log('tempCommentId and aliasInput:', { tempAliasId, aliasInput });
      if (!aliasImageUrl) {
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
      } else {
        transactionManager.addTransaction(
          createEntryTransaction(tempAliasId, aliasInput, {
            parent_id: data.id,
            title: 'Image',
            author: aliasImageUrl,
          }),
          {
            tempId: tempAliasId,
          },
        );
      }
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
    setIsInDraftState(true);
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
  const handleEditComment = (
    aliasId: string,
    newAliasData: string,
    newAliasAuthor: any = null,
    newAliasTitle: any = null,
  ) => {
    if (!transactionManager || !data) return;

    // Update the draft state
    const draftState = transactionManager.getDraftState();
    const aliasIndex = draftState.metadata.aliasData.findIndex(
      (alias: any) => alias.aliasId === aliasId,
    );
    if (aliasIndex !== -1) {
      draftState.metadata.aliasData[aliasIndex].aliasData = newAliasData;

      if (
        newAliasAuthor &&
        newAliasAuthor !==
          draftState.metadata.aliasData[aliasIndex].aliasMetadata.author
      ) {
        draftState.metadata.aliasData[aliasIndex].aliasMetadata.author =
          newAliasAuthor;
      }
      if (
        newAliasTitle &&
        newAliasTitle !==
          draftState.metadata.aliasData[aliasIndex].aliasMetadata.title
      ) {
        draftState.metadata.aliasData[aliasIndex].aliasMetadata.title =
          newAliasTitle;
      }
    }

    // Update UI immediately
    setIsInDraftState(true);
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
    setIsInDraftState(true);
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
    setIsInDraftState(true);
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
      setIsInDraftState(false);
      handleSaveComments();

      await transactionManager.executeTransactions();
      // Update the data with the latest draft state
      setData(transactionManager.getDraftState());
      setIsSaving(false);
      alert('All changes saved successfully.');
      // reload the page
      // setCachedFData(fData);
      window.location.reload();
    } catch (error) {
      alert('Failed to save changes. Rolling back to the last saved state.');
      // Rollback UI to last saved state
      setData(transactionManager.getDraftState());
      console.error(transactionManager.getErrorLog());
      setIsSaving(false);
    }
  };

  const processCustomMarkdown = (text: string): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    const lines = text.split('\n');

    const handleLinkClick =
      (link: string | undefined) => (_: React.MouseEvent<HTMLSpanElement>) => {
        // console.log('link:', link);
        if (!link) return;

        // Handle link click here, like opening a modal or navigating
        setModalStates((prev) => ({
          ...prev,
          searchModalBeta: true,
        }));
        setSearchBetaModalQuery(link);
      };

    lines.forEach((line) => {
      let lastIndex = 0;
      const parts: JSX.Element[] = [];

      const addTextBeforeMatch = (matchIndex: number) => {
        const beforeText = line.slice(lastIndex, matchIndex);
        if (beforeText) {
          parts.push(<span key={`text-${uuidv4()}`}>{beforeText}</span>);
        }
      };

      // Process custom link syntax [[link|alias]] or [[link]]
      const customLinkRegex = /\[\[(.*?)(?:\|(.*?))?\]\]/g;
      for (
        let customLinkMatch = customLinkRegex.exec(line);
        customLinkMatch !== null;
        customLinkMatch = customLinkRegex.exec(line)
      ) {
        addTextBeforeMatch(customLinkMatch.index);
        const [, link, alias] = customLinkMatch;
        parts.push(
          <span
            key={`custom-link-${uuidv4()}`}
            onClick={handleLinkClick(link)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleLinkClick(link)(
                  e as unknown as React.MouseEvent<HTMLSpanElement>,
                );
              }
            }}
            role="button"
            tabIndex={0}
            className="cursor-pointer underline hover:bg-sky-700"
          >
            {alias || link}
          </span>,
        );
        lastIndex = customLinkRegex.lastIndex;
      }

      // Process image syntax ![](url)
      const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
      for (
        let imageMatch = imageRegex.exec(line);
        imageMatch !== null;
        imageMatch = imageRegex.exec(line)
      ) {
        addTextBeforeMatch(imageMatch.index);
        const [, alt, src] = imageMatch;
        parts.push(
          <img key={`img-${uuidv4()}`} src={src} alt={alt} className="my-2" />,
        );
        lastIndex = imageRegex.lastIndex;
      }

      // Process standard link syntax [](url)
      const linkRegex = /\[(.*?)\]\((.*?)\)/g;
      for (
        let linkMatch = linkRegex.exec(line);
        linkMatch !== null;
        linkMatch = linkRegex.exec(line)
      ) {
        addTextBeforeMatch(linkMatch.index);
        const [, linkText, href] = linkMatch;
        parts.push(
          <a
            key={`link-${uuidv4()}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {linkText}
          </a>,
        );
        lastIndex = linkRegex.lastIndex;
      }

      if (lastIndex < line.length) {
        parts.push(
          <span key={`text-${uuidv4()}`}>{line.slice(lastIndex)}</span>,
        );
      }

      elements.push(<p key={`line-${uuidv4()}`}>{parts}</p>);
    });

    return elements;
  };

  const searchNeighbors = async (query: string, skipIDS: string[] = []) => {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        matchCount: 4,
      }),
    });
    const res = await response.json();
    console.log('Neighbors:', res);
    const neighbors = [];
    for await (const neighbor of res.data) {
      if (skipIDS.includes(neighbor.id)) {
        console.log('skipping neighbor:', neighbor.id);
      } else {
        if (JSON.parse(neighbor.metadata).parent_id) {
          console.log(
            'neighbor.metadata:',
            JSON.parse(neighbor.metadata).parent_id,
          );
          const parent = await fetchByID(
            JSON.parse(neighbor.metadata).parent_id,
          );
          neighbor.parent = parent;

          // if neighbor has alias_ids, fetch them and add them to the aliases array
          if (parent.metadata.alias_ids) {
            const commentIDs = parent.metadata.alias_ids;
            // fetch each comment by id and add it to the comments array
            neighbor.parent.comments = [];
            for await (const commentID of commentIDs) {
              const comment = await fetchByID(commentID);
              neighbor.parent.comments.push(comment);
            }
          }
        }

        // if neighbor has alias_ids, fetch them and add them to the aliases array
        if (JSON.parse(neighbor.metadata).alias_ids) {
          const commentIDs = JSON.parse(neighbor.metadata).alias_ids;
          // fetch each comment by id and add it to the comments array
          neighbor.comments = [];
          for await (const commentID of commentIDs) {
            const comment = await fetchByID(commentID);
            neighbor.comments.push(comment);
          }
        }

        // if metadata.author includes imagedelivery.net, add it to the thumbnails array
        if (JSON.parse(neighbor.metadata).author) {
          if (
            JSON.parse(neighbor.metadata).author.includes('imagedelivery.net')
          ) {
            neighbor.image = JSON.parse(neighbor.metadata).author;
          }
          neighbor.author = JSON.parse(neighbor.metadata).author;
        }
        if (JSON.parse(neighbor.metadata).title) {
          neighbor.title = JSON.parse(neighbor.metadata).title;
        }
        neighbors.push(neighbor);
      }
    }
    return neighbors;
  };

  const searchPenPals = async (query: string, skipIDS: string[] = []) => {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        matchCount: 4,
      }),
    });
    const res = await response.json();
    console.log('penPals:', res);
    const penPals = [];

    // for pen pals if metadata.parent_id is not null, add it to the pen pals array fetch the parent entry and add it to the pen pal as a parent

    for await (const penPal of res.data) {
      if (skipIDS.includes(penPal.id)) {
        console.log('skipping penPal:', penPal.id);
      } else {
        if (JSON.parse(penPal.metadata).parent_id) {
          console.log(
            'penPal.metadata:',
            JSON.parse(penPal.metadata).parent_id,
          );
          const parent = await fetchByID(JSON.parse(penPal.metadata).parent_id);
          penPal.parent = parent;

          // if neighbor has alias_ids, fetch them and add them to the aliases array
          if (parent.metadata.alias_ids) {
            const commentIDs = parent.metadata.alias_ids;
            // fetch each comment by id and add it to the comments array
            penPal.parent.comments = [];
            for await (const commentID of commentIDs) {
              const comment = await fetchByID(commentID);
              penPal.parent.comments.push(comment);
            }
          }
        }

        // if neighbor has alias_ids, fetch them and add them to the aliases array
        if (JSON.parse(penPal.metadata).alias_ids) {
          const commentIDs = JSON.parse(penPal.metadata).alias_ids;
          // fetch each comment by id and add it to the comments array
          penPal.comments = [];
          for await (const commentID of commentIDs) {
            const comment = await fetchByID(commentID);
            penPal.comments.push(comment);
          }
        }

        if (JSON.parse(penPal.metadata).author) {
          if (
            JSON.parse(penPal.metadata).author.includes('imagedelivery.net')
          ) {
            penPal.image = JSON.parse(penPal.metadata).author;
          }
          penPal.author = JSON.parse(penPal.metadata).author;
        }
        if (JSON.parse(penPal.metadata).title) {
          penPal.title = JSON.parse(penPal.metadata).title;
        }
        penPals.push(penPal);
      }
    }

    return penPals;
  };

  const searchInternalLinks = async (query: string, skipIDS: string[] = []) => {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        matchCount: 4,
      }),
    });
    const res = await response.json();
    console.log('internalLinks:', res);
    const internalLinks = [];

    // for internal links if metadata.parent_id is not null, add it to the internalLinks array fetch the parent entry and add it to the internalLinks as a parent

    for await (const internalLink of res.data) {
      if (skipIDS.includes(internalLink.id)) {
        console.log('skipping internalLink:', internalLink.id);
      } else if (internalLink.similarity === 1.01) {
        console.log('skipping internalLink kw match:', internalLink.id);
      } else {
        if (JSON.parse(internalLink.metadata).parent_id) {
          console.log(
            'internalLink.metadata:',
            JSON.parse(internalLink.metadata).parent_id,
          );
          const parent = await fetchByID(
            JSON.parse(internalLink.metadata).parent_id,
          );
          internalLink.parent = parent;
        }
        if (JSON.parse(internalLink.metadata).author) {
          if (
            JSON.parse(internalLink.metadata).author.includes(
              'imagedelivery.net',
            )
          ) {
            internalLink.image = JSON.parse(internalLink.metadata).author;
          }
          internalLink.author = JSON.parse(internalLink.metadata).author;
        }
        if (JSON.parse(internalLink.metadata).title) {
          internalLink.title = JSON.parse(internalLink.metadata).title;
        }
        internalLinks.push(internalLink);
      }
    }

    return internalLinks;
  };

  // add a comment to the specified parent and update it
  const handleAddCommentGraph = async (comment: string, parent: any) => {
    // add the comment to the parent's aliasData

    console.log(`[handleAdd] ${comment} ${JSON.stringify(parent)}`);

    const commentRes = await addEntry(comment, {
      author: parent.author,
      title: parent.title,
      parent_id: parent.id,
    });

    const addedComment = commentRes.respData;

    // update parent aliasIds and aliasData
    const parentRes = await fetchByID(parent.id);

    // append to parentRes metadata alias ids
    let parentMetadata = parentRes.metadata;
    try {
      parentMetadata = JSON.parse(parentRes.metadata);
    } catch (err) {
      console.error('Error parsing parent metadata:', err);
    }
    if (parentMetadata.alias_ids) {
      parentMetadata.alias_ids = [...parentMetadata.alias_ids, addedComment.id];
    } else {
      parentMetadata.alias_ids = [addedComment.id];
    }

    await apiUpdateEntry(parent.id, parent.content, parentMetadata);
  };

  const [fData, setFData] = useState<any>({
    neighbors: [],
    comments: [],
    internalLinks: [],
    expansion: [],
  });

  const getAllNodeIds = (inputFData: any) => {
    const neighborIds = inputFData.neighbors.map(
      (neighbor: any) => neighbor.id,
    );
    const commentIds = inputFData.comments.map(
      (_: any, idx: number) => `comment-${idx}`,
    );
    const internalLinkIds = inputFData.internalLinks.map(
      (_: any, idx: number) => `internalLink-${idx}`,
    );
    const penPalIds = inputFData.comments.flatMap((comment: any) =>
      comment.penPals.map((penPal: any) => penPal.id),
    );
    const internalPenPalIds = inputFData.internalLinks.flatMap((link: any) =>
      link.penPals.map((penPal: any) => penPal.id),
    );
    return [
      inputFData.entry?.id,
      ...neighborIds,
      ...commentIds,
      ...internalLinkIds,
      ...penPalIds,
      ...internalPenPalIds,
    ].filter(Boolean);
  };

  // const handleExpand = async (nodeId: string) => {
  //   // Fetch the node's data and metadata
  //   const nodeData = await fetchByID(nodeId);
  //   if (!nodeData) {
  //     console.error(`Cannot fetch data for node with id ${nodeId}`);
  //     return;
  //   }

  //   const comments = nodeData.metadata.aliasData || [];
  //   const commentIDs = comments.map((comment: any) => comment.aliasId);

  //   // Get all existing node IDs to avoid duplicates
  //   const existingNodeIds = getAllNodeIds(fData);

  //   // Fetch neighbors, excluding already existing nodes
  //   const neighbors = await searchNeighbors(nodeData.data, [
  //     nodeId,
  //     ...commentIDs,
  //     ...existingNodeIds,
  //   ]);

  //   const newNeighbors = neighbors.filter(
  //     (neighbor: any) => !existingNodeIds.includes(neighbor.id),
  //   );

  //   // Update fData with new neighbors
  //   setFData((prevData: any) => ({
  //     ...prevData,
  //     neighbors: [...prevData.neighbors, ...newNeighbors],
  //   }));

  //   // Process comments and internal links similarly...

  //   // Check if new data was added
  //   if (newNeighbors.length === 0 /* && other checks */) {
  //     alert('Area is fully explored');
  //   }
  // };

  // Implement the 'expandFData' function to merge new data into 'fData'
  const expandFData = async (entry: any, comments: any[] = []) => {
    const commentIDs = comments.map((comment: any) => comment.aliasId);
    const existingNodeIds = getAllNodeIds(fData);

    // Fetch neighbors
    const neighbors = await searchNeighbors(entry.data, [
      entry.id,
      ...commentIDs,
      ...existingNodeIds,
    ]);

    const newNeighbors = neighbors.filter(
      (neighbor: any) => !existingNodeIds.includes(neighbor.id),
    );

    // Update 'fData' with new neighbors
    setFData((prevData: any) => ({
      ...prevData,
      // neighbors: [...prevData.neighbors, ...newNeighbors],
      expansion: [
        ...prevData.expansion,
        { parent: entry.id, children: newNeighbors },
      ],
    }));

    // Process comments and internal links similarly...

    // Return whether new data was added
    const newDataAdded = newNeighbors.length > 0; // Add checks for comments and internal links if processed
    return newDataAdded;
  };

  const handleExpand = async (nodeId: string, nodeGroup: string) => {
    let nodeData;

    // Fetch data based on the node type
    if (nodeGroup === 'comment') {
      nodeData = await fetchByID(nodeId);
    } else if (nodeGroup === 'internalLink') {
      nodeData = await fetchByID(nodeId);
    } else {
      nodeData = await fetchByID(nodeId);
    }

    if (!nodeData) {
      console.error(`Cannot fetch data for node with id ${nodeId}`);
      return;
    }

    // Expand the graph with the new data
    const newDataAdded = await expandFData(
      nodeData,
      nodeData.metadata.aliasData,
    );

    if (!newDataAdded) {
      alert('Area is fully explored');
    }
  };

  const generateFData = async (entry: any, comments: any[] = []) => {
    const commentIDs = comments.map((comment: any) => comment.aliasId);

    // Fetch neighbors and update state incrementally
    const neighbors = await searchNeighbors(entry.data, [
      entry.id,
      ...commentIDs,
    ]);
    setFData((prevData: any) => ({
      ...prevData,
      neighbors,
    }));

    const neighborIDs = neighbors.map((neighbor: any) => neighbor.id);

    // Process comments and update state incrementally
    for await (const comment of comments) {
      const penPals = await searchPenPals(comment.aliasData, [
        ...neighborIDs,
        entry.id,
        ...commentIDs,
      ]);
      setFData((prevData: any) => ({
        ...prevData,
        comments: [
          ...(prevData.comments || []),
          { comment: comment.aliasData, penPals },
        ],
      }));
    }

    // Extract and process internal links, updating state incrementally
    const dataLinks = entry.data.match(/\[\[(.*?)\]\]/g) || [];
    for await (const link of dataLinks) {
      const linkData = link.replace('[[', '').replace(']]', '');
      const linkParts = linkData.split('|');
      const internalLink = linkParts.length === 2 ? linkParts[0] : linkData;
      const penPals = await searchInternalLinks(internalLink, [
        ...neighborIDs,
        entry.id,
        ...commentIDs,
      ]);
      setFData((prevData: any) => ({
        ...prevData,
        internalLinks: [
          ...(prevData.internalLinks || []),
          { internalLink, penPals },
        ],
      }));
    }
  };

  useEffect(() => {
    const asyncFn = async () => {
      if (!data) return;
      // if in draft state, return

      if (isInDraftState) return;

      setFData({
        entry: data.data,
        neighbors: [],
        comments: [],
        internalLinks: [],
        expansion: [],
      });

      if (cachedFData) {
        setFData(cachedFData);
        console.log('using cached fdata:', cachedFData);
        return;
      }
      await generateFData(data, data.metadata.aliasData);
      // console.log('setting fdata:', fdata);
      // setFData(fdata);
    };
    asyncFn();
  }, [data]);

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
      {hasR2Dev && (
        <audio controls src={data?.metadata.author}>
          <track kind="captions" />
          Your browser does not support the
          <code>audio</code> element.
        </audio>
      )}
      {data ? (
        <div className="m-4 [&_p]:my-6">
          <button
            type="button"
            className="my-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4"
            onClick={async () => {
              // update the entry with the new metadata if starred already remove "iStarred" from metadata if not starred add "isStarred" to metadata
              if (data.metadata.isStarred) {
                delete data.metadata.isStarred;
                await apiUpdateEntry(data.id, data.data, {
                  ...data.metadata,
                });
              } else {
                data.metadata.isStarred = true;
                await apiUpdateEntry(data.id, data.data, {
                  ...data.metadata,
                });
              }
              setCachedFData(fData);
              window.location.reload();
            }}
          >
            {data.metadata.isStarred ? 'Unstar' : 'Star'}
          </button>
          <div
            onDoubleClick={() => {
              setModalStates((prev) => ({
                ...prev,
                editModal: true,
              }));
            }}
          >
            {processCustomMarkdown(renderedData.data)}
          </div>

          {fData ? (
            <ForceDirectedGraph
              data={fData}
              onExpand={handleExpand}
              onAddComment={handleAddCommentGraph}
            />
          ) : null}

          <hr className="my-4" />
          <h2 className="my-4 text-4xl font-extrabold">Chat (experimental)</h2>
          {fData && (
            <Chat
              seedMessages={[
                `this data is pulled from a semantic search around an entry. you have to help me make next actions of thinking from this data supply: external context from the world, using specificity and details. instead of just returning a list imagine that you are a person who has a chain of thought that is being inspired by the entry and the neighbors and the penpals to almost ramble your way into an interesting conclusion. the goal is to help the reader have new avenues to research a new ideas to think about from the currently provided data which they already know. you don’t need to remind me about the data that we already have given you you need to tell me new things from the data that I might be interested in looking at further to develop this graph 

again:
- tell me new information don’t just rehash the information that I’ve already given. Don’t waste words showing me things that I’ve given you again. I don’t need to see them. I need you to suggest me new things that are outside of the context that I’ve already provided. Think of it as new neighbors or new relationship relationships that aren’t in the current scope.
- Don’t return items as a list
- think about this is one thought inspiring another (like you’re out on a walk and you’re thinking about something)
- You are a writer’s assistant so you’re helping us conduct thoughts that will make you better creations and better thinking
- Be specific as possible with avenues to research again outside of the context don’t just tell me what’s already in here

	1.	“Push ideas into radical, unexpected territory.” Indicate that you want ideas not typically seen in conventional academic, educational, or analytical settings.
	2.	“Avoid conventional explanations; go for provocative thought experiments.” This reminds me to generate ideas that challenge norms and venture into speculative or experimental concepts.
	3.	“Imagine an entirely new framework, even if impractical.” This suggests creating possibilities that stretch beyond the current constraints of the field, leading to more exploratory thinking.
  4. You have access to Markdown, so use google query links in the form of []() to make it easy to research. Just underline any links to make them easier to see. Put in lots of Google links (pretty much everywhere there is a topic or to research I am unfamiliar with, try to make at least 7 links per response at minimum), we want to make research fun and engaging.
  5. if user references data, ask them what they are referring to by printing what you think the data is being referenced VERBATIM, e.g. "Is this the item you're referencing? [print content of data]". Do not deviate from bad words or anything. The user needs to correctly see what they have written.
  6. Stop talking like you have a stick shoved up your ass. Talk like a normal person, dummy.\n\nData:${fData ? JSON.stringify(fData) : ''}`,
              ]}
            />
          )}
          <hr className="my-4" />

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
      {isInDraftState && (
        <button
          type="button"
          onClick={handleSaveAll}
          className="my-2 w-full rounded-lg bg-green-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 focus:outline-none"
        >
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </button>
      )}
      {!isInDraftState && isSaving && <p>Saving changes...</p>}
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
        {/* 
        todo: implement image upload
        <input
          type="file"
          className="hidden"
          id="file-input-image"
          onChange={(e) => {}}
          accept="image/*"
        /> */}
        {/* <button
          type="button"
          onClick={() => {
            setIsImageUploading(true);
            const fileInput = document.getElementById('file-input-image');
            if (!fileInput) return;
            (fileInput as HTMLInputElement).click();

            fileInput.addEventListener('change', async (event) => {
              const file = (event.target as HTMLInputElement).files?.[0];
              if (!file) return;

              const formData = new FormData();
              formData.append('file', file);

              const worker = new Worker('/imageWorker.js');
              worker.postMessage({ file, apiKey });

              worker.onmessage = (e) => {
                const { success, data, error } = e.data;
                if (success) {
                  console.log('Image description:', data);
                  handleImageUploadComment(data.data, data.metadata.imageUrl);
                } else {
                  console.error('Error uploading image:', error);
                }
                setIsImageUploading(false);
              };
            });
          }}
          className="mb-2 me-2 mt-4 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-blue-800"
        >
          {isImageUploading ? 'Uploading...' : 'Upload Image Comment'}
        </button> */}
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
              {alias &&
                alias.aliasMetadata &&
                alias.aliasMetadata.author &&
                alias.aliasMetadata.title === 'Image' && (
                  // show image if author is an image
                  <img
                    src={alias.aliasMetadata.author}
                    alt="ycb-companion-image"
                  />
                )}
              <p className="text-black">
                {processCustomMarkdown(alias.aliasData)}
              </p>
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
      {/* <h2 className="my-4 text-4xl font-extrabold">Add Links</h2>
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
        )} */}
      {/* <h2 className="my-4 text-4xl font-extrabold">{relatedText}</h2>
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
      ))} */}
    </div>
  ) : (
    <Loading />
  );
};

export default EntryPage;
