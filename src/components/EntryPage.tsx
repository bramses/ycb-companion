/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-param-reassign */

// EntryPage.tsx

'use client';

import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

import { useUser } from '@clerk/nextjs';
// import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  fetchFavicon,
  fetchRandomEntry,
  // fetchSearchEntries,
  // fetchSearchEntriesHelper,
  formatDate,
  // splitIntoWords,
  updateEntry as apiUpdateEntry,
} from '@/helpers/functions';

import { createEntryTransaction } from '../helpers/transactionFunctions';
import type { Transaction } from '../helpers/transactionManager';
import { TransactionManager } from '../helpers/transactionManager';
// import Chat from './Chat';
import EditModal from './EditModal';
import ForceDirectedGraph from './ForceDirectedGraph';
// import LinksModal from './LinksModal';
import Loading from './Loading';
import SearchModalBeta from './SearchModalBeta';
import ShareModal from './ShareModalV2';
import UploaderModalWrapper from './UploaderModalWrapper';
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
  const [tempComments, setTempComments] = useState<any[]>([]);
  // const [uniqueRelationships, setUniqueRelationships] = useState<any>(
  //   new Set(),
  // );

  const [modalStates, setModalStates] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [isGraphLoading, setIsGraphLoading] = useState(false);
  const [openShareModal, setOpenShareModal] = useState(false);

  // todo: implement image upload
  // const [isImageUploading, setIsImageUploading] = useState(false);
  // const apiKey = process.env.NEXT_PUBLIC_API_KEY_CF_IMG;
  // const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  // const [relatedText] = useState('Related Entries');

  const [searchBetaModalQuery, setSearchBetaModalQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [transactionManager, setTransactionManager] =
    useState<TransactionManager | null>(null);
  const [tempCommentIDs, setTempCommentIDs] = useState<any[]>([]);
  const [cachedFData] = useState<any>(null);
  const [isInDraftState, setIsInDraftState] = useState(false);
  const [favicon, setFavicon] = useState('/favicon.ico');

  const [graphNodes, setGraphNodes] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [randomCommentPlaceholder, setRandomCommentPlaceholder] = useState(
    'Add a comment... (press enter to save)',
  );

  const router = useRouter();

  function getNextIndex(
    gnigraphNodes: any[],
    gnicurrentIndex: number | null,
    direction: 1 | -1,
  ) {
    if (!gnigraphNodes.length) return null;

    // if currently null, just find first non-skipped
    if (currentIndex === null) {
      const idx = gnigraphNodes.findIndex(
        (n) => n.group !== 'main' && n.group !== 'comment',
      );
      return idx === -1 ? null : idx;
    }

    // otherwise loop
    let i = gnicurrentIndex;
    do {
      i = (i! + direction + gnigraphNodes.length) % gnigraphNodes.length;
    } while (
      gnigraphNodes[i].group === 'main' ||
      gnigraphNodes[i].group === 'comment'
    );

    return i;
  }

  // get a random entry on load
  useEffect(() => {
    const asyncFn = async () => {
      const entry = await fetchRandomEntry();
      setRandomCommentPlaceholder(entry.data);
    };
    asyncFn();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (graphNodes.length === 0) return;

      const target = event.target as HTMLElement;

      if (
        event.key === 'ArrowRight' &&
        !(event.target instanceof HTMLInputElement) &&
        !(event.target instanceof HTMLTextAreaElement) &&
        !target.tagName.toLowerCase().includes('input') &&
        !target.tagName.toLowerCase().includes('textarea')
      ) {
        // setCurrentIndex((prevIndex) => {
        //   if (prevIndex === null) return 0;
        //   return (prevIndex + 1) % graphNodes.length;
        // });
        setCurrentIndex((prev) => getNextIndex(graphNodes, prev, 1));
      } else if (
        event.key === 'ArrowLeft' &&
        !(event.target instanceof HTMLInputElement) &&
        !(event.target instanceof HTMLTextAreaElement) &&
        !target.tagName.toLowerCase().includes('input') &&
        !target.tagName.toLowerCase().includes('textarea')
      ) {
        // setCurrentIndex((prevIndex) => {
        //   if (prevIndex === null) return graphNodes.length - 1;
        //   return (prevIndex - 1 + graphNodes.length) % graphNodes.length;
        // });
        setCurrentIndex((prev) => getNextIndex(graphNodes, prev, -1));
      }

      if (
        event.key === 'Escape' &&
        !(event.target instanceof HTMLInputElement) &&
        !(event.target instanceof HTMLTextAreaElement) &&
        !target.tagName.toLowerCase().includes('input') &&
        !target.tagName.toLowerCase().includes('textarea')
      ) {
        event.preventDefault();
        setShowModal(false);
      }

      // if c for comment is pressed and !showModal, focus on the comment input
      // todo: this breaks after the modal has been opened
      if (
        event.key === 'c' &&
        !showModal &&
        !(event.target instanceof HTMLInputElement) &&
        !(event.target instanceof HTMLTextAreaElement) &&
        !target.tagName.toLowerCase().includes('input') &&
        !target.tagName.toLowerCase().includes('textarea')
      ) {
        event.preventDefault();
        const commentInput = document.getElementById(`alias-input-comment`);
        if (commentInput) {
          setTimeout(() => {
            commentInput.focus();
          }, 100);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [graphNodes]);

  useEffect(() => {
    let startX: number | null = null;
    function handleTouchStart(e: TouchEvent) {
      if (!showModal || window.innerWidth >= 768) return;
      if (e.touches.length > 0) startX = e.touches[0]!.clientX;
    }
    function handleTouchEnd(e: TouchEvent) {
      if (!showModal || window.innerWidth >= 768) return;
      if (startX === null) return;
      if (e.changedTouches.length > 0) {
        const endX = e.changedTouches[0]!.clientX;
        const deltaX = endX - startX;
        if (Math.abs(deltaX) > 50) {
          if (deltaX < 0) {
            // setCurrentIndex((prevIndex) => {
            //   if (prevIndex === null) return 0;
            //   return (prevIndex + 1) % graphNodes.length;
            // });
            setCurrentIndex((prev) => getNextIndex(graphNodes, prev, -1));
          } else {
            // setCurrentIndex((prevIndex) => {
            //   if (prevIndex === null) return graphNodes.length - 1;
            //   return (prevIndex - 1 + graphNodes.length) % graphNodes.length;
            // });
            setCurrentIndex((prev) => getNextIndex(graphNodes, prev, 1));
          }
        }
      }
      startX = null;
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [showModal, graphNodes]);

  const openModal = (key: string) =>
    setModalStates((prev) => ({ ...prev, [key]: true }));
  const closeModal = (key: string) =>
    setModalStates((prev) => ({ ...prev, [key]: false }));

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

  useEffect(() => {
    if (data?.metadata?.author) {
      fetchFavicon(data.metadata.author).then((res) => {
        setFavicon(res.favicon);
      });
    }
  }, [data]);

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
            window.location.href = '/404'; // todo a react toast instead
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

  useEffect(() => {
    if (data) {
      document.title = data.data;
    }
  }, [data]);
  // const handleAddComment = (aliasInput: string) => {
  //   if (!transactionManager || !data) return;
  //   console.log('alias:', aliasInput);

  //   // Assign a temporary ID
  //   const tempAliasId = `temp-${uuidv4()}`;

  //   // Update the draft state
  //   const draftState = transactionManager.getDraftState();
  //   const newAliasData = {
  //     aliasId: tempAliasId,
  //     aliasData: aliasInput,
  //     aliasCreatedAt: new Date().toISOString(),
  //     aliasUpdatedAt: new Date().toISOString(),
  //     aliasMetadata: {
  //       title: data.metadata.title,
  //       author: data.metadata.author,
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

  //   // Transaction to create the alias entry
  //   // const createAliasTx = createEntryTransaction(tempAliasId, alias, {
  //   //   parent_id: data.id,
  //   //   title: data.metadata.title,
  //   //   author: data.metadata.author,
  //   // });

  //   // const updateParentTx: Transaction = async (
  //   //   context: any,
  //   // ) => {
  //   //   const actualAliasId = context.idMapping.get(tempAliasId);
  //   //   if (!actualAliasId) {
  //   //     throw new Error(`Failed to resolve ID for temporary ID ${tempAliasId}`);
  //   //   }
  //   //   // remove the temporary alias ID from the alias_ids array
  //   //   const updatedAliasIds = [
  //   //     actualAliasId,
  //   //     ...(data.metadata.alias_ids.filter(
  //   //       (id: string) => id !== tempAliasId,
  //   //     ) || []),
  //   //   ];
  //   //   console.log('updatedAliasIds:', updatedAliasIds);

  //   //   // remove aliasData from metadata
  //   //   delete data.metadata.aliasData;

  //   //   await apiUpdateEntry(data.id, data.data, {
  //   //     ...data.metadata,
  //   //     alias_ids: updatedAliasIds,
  //   //   });
  //   // };

  //   // Add transactions with dependencies
  //   // transactionManager.addTransaction(createAliasTx, { tempId: tempAliasId });
  //   // add the tempAliasId to the tempCommentIDs array
  //   setTempCommentIDs((prev) => [...prev, { tempAliasId, aliasInput }]);
  //   // transactionManager.addTransaction(updateParentTx, {
  //   //   dependencies: [tempAliasId],
  //   // });
  // };

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

  const checkForEmbeddings = async (entryId: string, aliasIDs: string[]) => {
    const response = await fetch(`/api/checkForEmbed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: entryId,
      }),
    });

    const adata = await response.json();
    if (adata.data.status !== 'completed') return false;

    for await (const aliasID of aliasIDs) {
      const cresponse = await fetch(`/api/checkForEmbed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: entryId,
          aliasID,
        }),
      });
      const cdata = await cresponse.json();
      if (cdata.data.status !== 'completed') return false;
    }

    return true;
  };

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

      elements.push(
        <span
          key={`line-${uuidv4()}`}
          style={{ display: 'block', marginBottom: '1em' }}
        >
          {parts}
        </span>,
      );
    });

    return elements;
  };

  const searchNeighbors = async (
    platformId: string,
    skipIDS: string[] = [],
  ) => {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ platformId, matchCount: 6 }),
    });
    const res = await response.json();

    const neighbors = await Promise.all(
      res.data.map(async (neighbor: any) => {
        if (skipIDS.includes(neighbor.id)) return null;

        // parent fetch in parallel with neighbor's alias fetch
        const parentId = neighbor.metadata.parent_id;
        const aliasIds = neighbor.metadata.alias_ids || [];

        const [parentData, neighborAliases] = await Promise.all([
          parentId ? fetchByID(parentId) : Promise.resolve(null),
          Promise.all(aliasIds.map((id: string) => fetchByID(id))),
        ]);

        if (parentData) {
          neighbor.parent = parentData;
          if (parentData.metadata.alias_ids) {
            // neighbor.parent.comments = await Promise.all(
            //   parentData.metadata.alias_ids.map((id: string) => fetchByID(id))
            // );

            const aliasCommentsPromise = Promise.all(
              parentData.metadata.alias_ids.map((id: string) => fetchByID(id)),
            );

            // Optionally handle the alias comments when they are ready
            aliasCommentsPromise
              .then((comments) => {
                neighbor.parent.comments = comments;
              })
              .catch((error) => {
                console.error('Error fetching alias comments:', error);
              });
          }
        }

        if (neighborAliases.length) {
          neighbor.comments = neighborAliases;
        }

        // handle metadata
        if (neighbor.metadata.author) {
          if (neighbor.metadata.author.includes('imagedelivery.net')) {
            neighbor.image = neighbor.metadata.author;
          }
          neighbor.author = neighbor.metadata.author;
        }
        if (neighbor.metadata.title) {
          neighbor.title = neighbor.metadata.title;
        }

        if (neighbor.createdAt) {
          neighbor.createdAt = new Date(neighbor.createdAt).toISOString();
        }

        return neighbor;
      }),
    );

    const filteredNeighbors = neighbors.filter(Boolean);
    return filteredNeighbors;
  };

  const searchPenPals = async (platformId: string, skipIDS: string[] = []) => {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ platformId, matchCount: 6 }),
    });
    const res = await response.json();

    const penPals = await Promise.all(
      res.data.map(async (penPal: any) => {
        if (skipIDS.includes(penPal.id)) return null;

        const parentId = penPal.metadata.parent_id;
        const aliasIds = penPal.metadata.alias_ids || [];

        const [parentData, penPalAliases] = await Promise.all([
          parentId ? fetchByID(parentId) : null,
          Promise.all(aliasIds.map((id: string) => fetchByID(id))),
        ]);

        if (parentData) {
          penPal.parent = parentData;
          if (parentData.metadata.alias_ids) {
            // penPal.parent.comments = await Promise.all(
            //   parentData.metadata.alias_ids.map((id: string) => fetchByID(id))
            // );

            const aliasCommentsPromise = Promise.all(
              parentData.metadata.alias_ids.map((id: string) => fetchByID(id)),
            );

            // Optionally handle the alias comments when they are ready
            aliasCommentsPromise
              .then((comments) => {
                penPal.parent.comments = comments;
              })
              .catch((error) => {
                console.error('Error fetching alias comments:', error);
              });
          }
        }

        if (penPalAliases.length) {
          penPal.comments = penPalAliases;
        }

        if (penPal.metadata.author) {
          if (penPal.metadata.author.includes('imagedelivery.net')) {
            penPal.image = penPal.metadata.author;
          }
          penPal.author = penPal.metadata.author;
        }
        if (penPal.metadata.title) {
          penPal.title = penPal.metadata.title;
        }

        if (penPal.createdAt) {
          penPal.createdAt = new Date(penPal.createdAt).toISOString();
        }

        return penPal;
      }),
    );

    return penPals.filter(Boolean);
  };

  const searchInternalLinks = async (query: string, skipIDS: string[] = []) => {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, matchCount: 6 }),
    });
    const res = await response.json();

    const internalLinks = await Promise.all(
      res.data.map(async (link: any) => {
        if (skipIDS.includes(link.id) || link.similarity === 1.01) return null;

        const parentId = link.metadata.parent_id;
        if (parentId) {
          const parentData = await fetchByID(parentId);
          link.parent = parentData;
        }

        if (link.metadata.author) {
          if (link.metadata.author.includes('imagedelivery.net')) {
            link.image = link.metadata.author;
          }
          link.author = link.metadata.author;
        }
        if (link.metadata.title) {
          link.title = link.metadata.title;
        }

        if (link.createdAt) {
          link.createdAt = new Date(link.createdAt).toISOString();
        }

        return link;
      }),
    );

    return internalLinks.filter(Boolean);
  };

  // add a comment to the specified parent and update it
  const handleAddCommentGraph = async (comment: string, parent: any) => {
    // add the comment to the parent's aliasData

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
      parentMetadata = parentRes.metadata;
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
    const expansionIds = inputFData.expansion.flatMap((expansion: any) =>
      expansion.children.map((child: any) => child.id),
    );

    return [
      inputFData.entry?.id,
      ...neighborIds,
      ...commentIds,
      ...internalLinkIds,
      ...penPalIds,
      ...internalPenPalIds,
      ...expansionIds,
    ].filter(Boolean);
  };

  const expandFData = async (entryId: any, commentId: any) => {
    const existingNodeIds = getAllNodeIds(fData);

    if (!commentId) {
      // Fetch neighbors
      const neighbors = await searchNeighbors(entryId, [
        entryId,
        ...existingNodeIds,
      ]);

      // append entry.id to existingNodeIds

      const newNeighbors = neighbors.filter(
        (neighbor: any) => !existingNodeIds.includes(neighbor.id),
      );

      // Update 'fData' with new neighbors
      setFData((prevData: any) => ({
        ...prevData,
        // neighbors: [...prevData.neighbors, ...newNeighbors],
        expansion: [
          ...prevData.expansion,
          { parent: entryId, children: newNeighbors, comment: 'todo' },
        ],
      }));

      // Process comments and internal links similarly...

      // Return whether new data was added
      const newDataAdded = newNeighbors.length > 0; // Add checks for comments and internal links if processed
      return newDataAdded;
    }
    // Fetch neighbors
    const neighbors = await searchNeighbors(commentId, [
      entryId,
      commentId,
      ...existingNodeIds,
    ]);

    // append entry.id to existingNodeIds

    const newNeighbors = neighbors.filter(
      (neighbor: any) => !existingNodeIds.includes(neighbor.id),
    );

    // Update 'fData' with new neighbors
    setFData((prevData: any) => ({
      ...prevData,
      // neighbors: [...prevData.neighbors, ...newNeighbors],
      expansion: [
        ...prevData.expansion,
        { parent: entryId, children: newNeighbors, comment: 'todo' },
      ],
    }));

    // Process comments and internal links similarly...

    // Return whether new data was added
    const newDataAdded = newNeighbors.length > 0; // Add checks for comments and internal links if processed
    return newDataAdded;
  };

  const handleExpand = async (
    nodeId: string,
    initNodeDataID: string | null = null,
  ) => {
    setIsGraphLoading(true);

    if (!initNodeDataID) {
      // Expand the graph with the new data
      const newDataAdded = await expandFData(nodeId, null);

      if (!newDataAdded) {
        alert('Area is fully explored');
      }
      setIsGraphLoading(false);
    } else {
      // Expand the graph with the new data
      const newDataAdded = await expandFData(nodeId, initNodeDataID);

      if (!newDataAdded) {
        alert('Area is fully explored');
      }
      setIsGraphLoading(false);
    }
  };

  const generateFData = async (entry: any, comments: any[] = []) => {
    console.time('generateFData');
    setIsGraphLoading(true);

    // check that all embeddings are completed
    // ... existing code ...
    const checkEmbeddingsWithDelay = async (
      entryId: string,
      maxTries: number,
      currentTry = 0,
    ): Promise<boolean> => {
      if (currentTry >= maxTries) return false;
      const allEmbeddingsComplete = await checkForEmbeddings(entryId, []);
      if (allEmbeddingsComplete) return true;
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 1000);
      });
      return checkEmbeddingsWithDelay(entryId, maxTries, currentTry + 1);
    };

    const allEmbeddingsComplete = await checkEmbeddingsWithDelay(entry.id, 10);

    if (!allEmbeddingsComplete) {
      console.log('Embeddings not complete after 10 tries -- try again later');
      alert('Failed to complete embeddings. Please try again later.');
      // Optionally, you can redirect the user or take other actions
      return;
    }

    const commentIDs = comments.map((comment: any) => comment.aliasId);

    // console.log(entry)

    // Create a promise for neighbors
    // TODO im rolling over to a platform_id search
    const neighborsPromise = searchNeighbors(entry.id, [
      entry.id,
      ...commentIDs,
    ]);

    const commentsPromises = comments.map(async (comment: any) => {
      const penPals = await searchPenPals(comment.aliasId, [
        entry.id,
        ...commentIDs,
      ]);
      return { comment: comment.aliasData, penPals, id: comment.aliasId };
    });

    const dataLinks = entry.data.match(/\[\[(.*?)\]\]/g) || [];
    const internalLinksPromises = dataLinks.map(async (link: any) => {
      const linkData = link.replace('[[', '').replace(']]', '');
      const linkParts = linkData.split('|');
      const internalLink = linkParts.length === 2 ? linkParts[0] : linkData;
      const penPals = await searchInternalLinks(internalLink, [
        entry.id,
        ...commentIDs,
      ]);
      return { internalLink, penPals };
    });

    // Await all promises together
    const [neighbors, processedComments, processedInternalLinks] =
      await Promise.all([
        neighborsPromise,
        Promise.all(commentsPromises),
        Promise.all(internalLinksPromises),
      ]);

    setFData((prevData: any) => ({
      ...prevData,
      neighbors,
      comments: processedComments,
      internalLinks: processedInternalLinks,
    }));
    setIsGraphLoading(false);
    console.timeEnd('generateFData');
  };

  const addCommentV2 = async (
    aliasInput: string,
    parent: { id: string; data: string; metadata: any },
  ) => {
    // moving away from transaction manager
    // the goal is 1) add comment 2) update parent entry 3) extend the force directed graph with the new comment
    // dont need to refresh the page

    // add comment to data to visually show it

    setTempComments((prev) => [
      ...prev,
      {
        aliasId: `temp-${uuidv4()}`,
        aliasData: aliasInput,
        aliasCreatedAt: new Date().toISOString(),
        aliasUpdatedAt: new Date().toISOString(),
        aliasMetadata: {
          title: parent.metadata.title,
          author: parent.metadata.author,
          parent_id: parent.id,
        },
      },
    ]);

    // set saving changes to true
    setIsSaving(true);
    const addedComment = await fetch(`/api/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: aliasInput,
        metadata: {
          title: parent.metadata.title,
          author: parent.metadata.author,
          parent_id: parent.id,
        },
      }),
    });

    const addedCommentRespData = await addedComment.json();
    const addedCommentData = addedCommentRespData.respData;

    const parentRes = await fetchByID(parent.id);
    let parentResMetadata = parentRes.metadata;
    try {
      parentResMetadata = parentRes.metadata;
    } catch (err) {
      console.error('Error parsing parent metadata:', err);
    }
    if (parentResMetadata.alias_ids) {
      parentResMetadata.alias_ids = [
        ...parentResMetadata.alias_ids,
        addedCommentData.id,
      ];
    } else {
      parentResMetadata.alias_ids = [addedCommentData.id];
    }

    await apiUpdateEntry(parent.id, parent.data, {
      ...parentResMetadata,
    });

    setIsSaving(false);

    setIsGraphLoading(true);

    const checkEmbeddingsWithDelay = async (
      entryId: string,
      maxTries: number,
      currentTry = 0,
    ): Promise<boolean> => {
      if (currentTry >= maxTries) return false;
      const allEmbeddingsComplete = await checkForEmbeddings(entryId, []);
      if (allEmbeddingsComplete) return true;
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 1000);
      });
      return checkEmbeddingsWithDelay(entryId, maxTries, currentTry + 1);
    };

    const allEmbeddingsComplete = await checkEmbeddingsWithDelay(
      addedCommentData.id,
      10,
    );

    if (!allEmbeddingsComplete) {
      console.log('Embeddings not complete after 10 tries -- try again later');
      alert('Failed to complete embeddings. Please try again later.');
      // Optionally, you can redirect the user or take other actions
      return;
    }

    // extend the force directed graph with the new comment
    // get pen pals
    // todo the switch of the order of update and fetchByID is causing the graph to not update correctly
    const penPals = await searchPenPals(addedCommentData.id, [
      parent.id,
      addedCommentData.id,
    ]);
    setFData((prevData: any) => ({
      ...prevData,
      comments: [
        ...(prevData.comments || []),
        { comment: aliasInput, penPals, id: addedCommentData.id },
      ],
    }));

    setIsGraphLoading(false);
  };

  function timeAgo(date: Date): string {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals: { [key: string]: number } = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const [key, value] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / value);
      if (interval >= 1) {
        return `${interval} ${key}${interval > 1 ? 's' : ''} ago`;
      }
    }

    return 'just now';
  }

  const handleDeleteEntryV2 = async () => {
    if (!data) return;
    // Check if there are alias IDs
    if (data.metadata.alias_ids && data.metadata.alias_ids.length > 0) {
      alert('Please delete all comments before deleting the entry.');
      return;
    }

    // Confirm deletion
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this entry?',
    );
    if (!confirmDelete) return;

    try {
      // Attempt to delete the entry via API
      const response = await fetch(`/api/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: data.id }),
      });

      if (response.ok) {
        // Redirect to homepage on successful deletion
        window.location.href = '/dashboard';
      } else {
        throw new Error('Failed to delete entry');
      }
    } catch (error) {
      alert('Failed to delete entry. Please try again.');
      console.error('Error deleting entry:', error);
    }
  };

  // const handleDeleteCommentV2 = async (aliasId: string) => {
  //   if (!data) return;

  //   // Confirm deletion
  //   const confirmDelete = window.confirm(
  //     'Are you sure you want to delete this comment?',
  //   );
  //   if (!confirmDelete) return;
  //   setIsSaving(true);

  //   const entryToBeDeleted = await fetchByID(aliasId);

  //   // update the parent entry to remove the deleted comment
  //   const parentEntry = await fetchByID(entryToBeDeleted.metadata.parent_id);
  //   if (!parentEntry) return;

  //   try {
  //     // Attempt to delete the comment via API
  //     const response = await fetch(`/api/delete`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ id: aliasId }),
  //     });

  //     await apiUpdateEntry(parentEntry.id, parentEntry.data, {
  //       ...parentEntry.metadata,
  //       alias_ids: parentEntry.metadata.alias_ids.filter(
  //         (id: string) => id !== aliasId
  //       ),
  //     });

  //     setIsSaving(false);

  //     // if (response.ok) {
  //     //   // Update the local state to remove the deleted comment
  //     //   setData((prevData) => {
  //     //     if (!prevData) return null;
  //     //     const updatedAliasData = prevData.metadata.aliasData.filter(
  //     //       (alias: any) => alias.aliasId !== aliasId
  //     //     );
  //     //     const updatedAliasIds = prevData.metadata.alias_ids.filter(
  //     //       (id: string) => id !== aliasId
  //     //     );

  //     //     return {
  //     //       ...prevData,
  //     //       metadata: {
  //     //         ...prevData.metadata,
  //     //         aliasData: updatedAliasData,
  //     //         alias_ids: updatedAliasIds,
  //     //       },
  //     //     };
  //     //   });
  //     //   alert('Comment deleted successfully.');
  //     // } else {
  //     //   throw new Error('Failed to delete comment');
  //     // }
  //   } catch (error) {
  //     alert('Failed to delete comment. Please try again.');
  //     console.error('Error deleting comment:', error);
  //   }
  // };

  const handleEditEntryV2 = async (newData: string, newMetadata: any) => {
    if (!data) return;

    // Set saving state to true
    setIsSaving(true);

    const updatedMetadata = { ...newMetadata };
    if (updatedMetadata.aliasData) {
      delete updatedMetadata.aliasData;
    }

    try {
      // Make an API call to update the entry
      await fetch(`/api/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: data.id,
          data: newData,
          metadata: updatedMetadata,
        }),
      });

      // Update the state with the new data and metadata
      setData((prevData) => ({
        data: newData,
        metadata: newMetadata,
        id: data.id,
        createdAt: prevData!.createdAt,
      }));

      // reload graph
      // console.log('reloading graph');
      // generateFData(data, data.metadata.aliasData);

      // Optionally, update any other state or UI elements as needed
      console.log('Entry updated successfully');
    } catch (error) {
      console.error('Failed to update entry:', error);
    } finally {
      // Reset saving state
      setIsSaving(false);
    }
  };

  const [isSearchModalBetaOpen, setSearchModalBetaOpen] = useState(false);
  const [isUploaderModalOpen, setUploaderModalOpen] = useState(false);

  const closeModalActions = () => {
    setSearchModalBetaOpen(false);
    setUploaderModalOpen(false);
  };

  const handleRandomOpen = async () => {
    // fetch a random entry and open it
    const entry = await fetchRandomEntry();
    router.push(`/dashboard/entry/${entry.id}`);
  };

  // const exportGraph = () => {
  //   // load a ShareModal component
  //   // const graphData = JSON.stringify(fData);
  //   // const element = document.createElement('a');
  //   // element.setAttribute(
  //   //   'href',
  //   //   `data:text/json;charset=utf-8,${encodeURIComponent(graphData)}`,
  //   // );
  //   // element.setAttribute('download', 'graph.json');
  //   // element.style.display = 'none';
  //   // document.body.appendChild(element);
  //   // element.click();
  // };

  useEffect(() => {
    const asyncFn = async () => {
      if (!data) return;
      // if in draft state, return

      if (isInDraftState) return;

      setFData({
        entry: data,
        neighbors: [],
        comments: [],
        internalLinks: [],
        expansion: [],
      });

      if (cachedFData) {
        setFData(cachedFData);
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
    <div className="min-h-screen min-w-full max-w-full px-5 py-4">
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
        <div className="mb-2 [&_p]:my-2">
          {/* todo Implement star button functionality */}
          {/* <button
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
          </button> */}
          <div
            onDoubleClick={() => {
              setModalStates((prev) => ({
                ...prev,
                editModal: true,
              }));
            }}
            className="mt-2 text-neutral-dark [&_p]:my-6"
          >
            {processCustomMarkdown(data.data)}
            <div className="float-right mb-2">
              <Link
                href={data.metadata.author}
                className=" float-right inline-flex items-center font-medium text-brand hover:underline"
                target="_blank"
              >
                <img src={favicon} alt="favicon" className="mr-2 size-6" />
                {data.metadata.title}
                <UrlSVG />
              </Link>
              <br />
              <a
                href={`/dashboard/garden?date=${new Date(data.createdAt)
                  .toLocaleDateString()
                  .split('/')
                  .map((d) => (d.length === 1 ? `0${d}` : d))
                  .join('-')}
                `}
                className="float-right inline-flex items-center font-medium text-brand hover:underline"
              >
                {timeAgo(new Date(data.createdAt))}
              </a>
            </div>
          </div>

          {/* <button
            onClick={() => setOpenShareModal(true)}
            type="button"
            className="mt-2 w-full rounded border border-neutral-light bg-neutral-light p-2 text-neutral-dark focus:border-brand focus:ring-brand"
          >
            Share
          </button>
          {openShareModal && (
            <ShareModal
              entry={{
                data: data.data,
                image:
                  data.metadata.author === 'imagedelivery.net'
                    ? data.metadata.author
                    : null,
                metadata: {
                  title: data.metadata.title,
                  author: data.metadata.author,
                },
              }}
              comments={
                data.metadata && data.metadata.aliasData
                  ? data.metadata.aliasData.map((comment: any) => {
                      return {
                        data: comment.aliasData,
                        image:
                          comment.aliasMetadata.author === 'imagedelivery.net'
                            ? comment.metadata.author
                            : null,
                        metadata: {
                          title: comment.aliasMetadata.title,
                          author: comment.aliasMetadata.author,
                        },
                      };
                    })
                  : []
              }
              isOpen={openShareModal}
              entryId={data.id}
              closeModalFn={() => setOpenShareModal(false)}
            />
          )} */}

          {/* todo chatycb */}
          {/* <hr className="my-4" />
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
  5. if user references data, ask them what they are referring to by printing what you think the data is being referenced VERBATIM, e.g. "Is this the item you're referencing? [print content of data]". Do not deviate from bad words or anything. The user needs to correctly see what they have written.\n\nData:${fData ? JSON.stringify(fData) : ''}`,
              ]}
            />
          )}
          <hr className="my-4" /> */}

          <EditModal
            isOpen={modalStates.editModal || false}
            closeModalFn={() => closeModal('editModal')}
            data={renderedData.data}
            id={renderedData.id}
            disabledKeys={['aliasData', 'alias_ids', 'links', 'parent_id']}
            metadata={renderedData.metadata}
            onSave={handleEditEntryV2}
          />
          <SearchModalBeta
            isOpen={modalStates.searchModalBeta || false}
            closeModalFn={() => closeModal('searchModalBeta')}
            inputQuery={searchBetaModalQuery}
          />

          {/* <button
            type="button"
            onClick={() => openModal('editModal')}
            className="my-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4"
          >
            Edit Entry
          </button> */}
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
      <div className="">
        <textarea
          rows={3}
          style={{ fontSize: '17px' }}
          className="mb-2 w-full rounded border border-neutral-dark bg-white px-4 py-2 text-neutral-dark transition hover:bg-neutral-light"
          placeholder={randomCommentPlaceholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const aliasInput = document.getElementById(`alias-input-comment`);
              if (
                !aliasInput ||
                (aliasInput as HTMLInputElement).value.trim() === ''
              )
                return;
              // Cast to HTMLInputElement to access value property
              const alias = (aliasInput as HTMLInputElement).value;
              // if empty alias, do not add
              if (!alias || alias.trim() === '') {
                console.log('empty alias');
                return;
              }
              // handleAddComment(alias);
              addCommentV2(alias, {
                id: renderedData.id,
                data: renderedData.data,
                metadata: renderedData.metadata,
              });
              // clear input field
              (aliasInput as HTMLInputElement).value = ''.trim();
            }
          }}
          id="alias-input-comment"
        />
        <button
          type="button"
          onClick={() => {
            const aliasInput = document.getElementById(`alias-input-comment`);
            if (!aliasInput) return;
            // Cast to HTMLInputElement to access value property
            const alias = (aliasInput as HTMLInputElement).value;
            // if empty alias, do not add
            if (!alias || alias.trim() === '') {
              console.log('empty alias');
              return;
            }
            // handleAddComment(alias);
            addCommentV2(alias, {
              id: renderedData.id,
              data: renderedData.data,
              metadata: renderedData.metadata,
            });
            // clear input field
            (aliasInput as HTMLInputElement).value = '';
          }}
          className="w-full rounded border border-neutral-light bg-neutral-light p-2 text-neutral-dark focus:border-brand focus:ring-brand"
          aria-label="Add alias"
        >
          Add Comment
        </button>

        {/* <div className="relative mb-4 w-full">
          <textarea
            rows={3}
            style={{ fontSize: '17px' }}
            className="w-full rounded border border-neutral-dark bg-white px-4 py-2 pr-10 text-neutral-dark"
            placeholder="add a comment..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const aliasInput = document.getElementById(
                  'alias-input-comment',
                );
                if (!aliasInput) return;
                const alias = (aliasInput as HTMLInputElement).value.trim();
                if (!alias) return;
                addCommentV2(alias, {
                  id: renderedData.id,
                  data: renderedData.data,
                  metadata: renderedData.metadata,
                });
                (aliasInput as HTMLInputElement).value = '';
              }
            }}
            id="alias-input-comment"
          />
          <button
            type="button"
            onClick={() => {
              const aliasInput = document.getElementById('alias-input-comment');
              if (!aliasInput) return;
              const alias = (aliasInput as HTMLInputElement).value.trim();
              if (!alias) return;
              addCommentV2(alias, {
                id: renderedData.id,
                data: renderedData.data,
                metadata: renderedData.metadata,
              });
              (aliasInput as HTMLInputElement).value = '';
            }}
            className="absolute bottom-2 right-2 rounded-full border border-neutral-light bg-neutral-light px-3 pb-1 text-xl text-neutral-dark focus:border-brand focus:ring-brand"
            aria-label="add alias"
          >
            +
          </button>
        </div> */}

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
      {!isInDraftState && isSaving && <b>Saving changes...</b>}

      {/* {renderedData.metadata.aliasData &&
        renderedData.metadata.aliasData.length > 0 && (
          <h2 className="my-4 text-4xl font-extrabold">Comments</h2>
        )} */}
      <div>
        {renderedData?.metadata?.aliasData?.map((alias: any) => (
          <div key={alias.aliasId} className="my-6 border-neutral-light">
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
              {/* {alias &&
                alias.aliasMetadata &&
                alias.aliasMetadata.author &&
                alias.aliasMetadata.title === 'Image' && (
                  // show image if author is an image
                  <img
                    src={alias.aliasMetadata.author}
                    alt="ycb-companion-image"
                  />
                )} */}
              <p className="text-black">
                {processCustomMarkdown(alias.aliasData)}
              </p>
            </div>
            <p className="text-sm text-gray-500">{alias.aliasCreatedAt}</p>
            <div className="flex">
              {/* <button
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
              </button> */}
              {alias.aliasId.includes('temp-') ? (
                '(Refresh page to delete)'
              ) : (
                <>
                  {/* <button
                    className="mr-4 justify-start text-blue-600 hover:underline"
                    type="button"
                    onClick={() => openModal(`alias-${alias.aliasId}`)}
                    aria-label="edit"
                  >
                    Edit
                  </button> */}
                  <button
                    className="justify-start text-blue-600 hover:underline"
                    type="button"
                    onClick={() => handleDeleteComment(alias.aliasId)}
                    aria-label="delete"
                  >
                    Delete Comment
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {tempComments.map((alias) => (
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
              {/* {alias &&
                alias.aliasMetadata &&
                alias.aliasMetadata.author &&
                alias.aliasMetadata.title === 'Image' && (
                  // show image if author is an image
                  <img
                    src={alias.aliasMetadata.author}
                    alt="ycb-companion-image"
                  />
                )} */}
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
              {alias.aliasId.includes('temp-') ? null : (
                <>
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
                </>
              )}
            </div>
            <hr className="mt-2 w-full" />
          </div>
        ))}
      </div>
      {showAliasError && (
        <div className="text-red-500">Error adding comment. Try again.</div>
      )}
      <hr className="my-8 h-px w-full border-0 bg-gray-200 dark:bg-gray-700" />

      {data ? (
        <div className="mb-2 [&_p]:my-2">
          <button
            onClick={() => setOpenShareModal(true)}
            type="button"
            className="mt-2 w-full rounded border border-neutral-light bg-neutral-light p-2 text-neutral-dark focus:border-brand focus:ring-brand"
          >
            Share
          </button>
          {openShareModal && (
            <ShareModal
              entry={{
                data: data.data,
                image:
                  data.metadata.author === 'imagedelivery.net'
                    ? data.metadata.author
                    : null,
                metadata: {
                  title: data.metadata.title,
                  author: data.metadata.author,
                },
              }}
              comments={
                data.metadata && data.metadata.aliasData
                  ? data.metadata.aliasData.map((comment: any) => {
                      return {
                        data: comment.aliasData,
                        image:
                          comment.aliasMetadata.author === 'imagedelivery.net'
                            ? comment.metadata.author
                            : null,
                        metadata: {
                          title: comment.aliasMetadata.title,
                          author: comment.aliasMetadata.author,
                        },
                      };
                    })
                  : []
              }
              isOpen={openShareModal}
              entryId={data.id}
              closeModalFn={() => setOpenShareModal(false)}
            />
          )}
        </div>
      ) : (
        'Loading...'
      )}
      <button
        type="button"
        onClick={handleDeleteEntryV2}
        className="my-2 me-2 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4"
      >
        Delete Entry
      </button>
      {showDeleteError && (
        <div className="text-red-500">
          Error deleting entry, delete comments first if you want to delete the
          entry.
        </div>
      )}
      {fData ? (
        <div className="relative">
          <div className="relative">
            <ForceDirectedGraph
              data={fData}
              onExpand={handleExpand}
              isGraphLoading={isGraphLoading}
              onAddComment={handleAddCommentGraph}
              graphNodes={graphNodes}
              setGraphNodes={setGraphNodes}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              showModal={showModal}
              setShowModal={setShowModal}
            />
            <p className="text-sm text-gray-500">
              Use left/right arrow keys to navigate, swipe left/right on mobile
              to cycle through entries (open an entry first).
              <br />
            </p>
            {isGraphLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/75">
                <span className="text-lg font-bold">Loading...</span>
              </div>
            )}
          </div>
        </div>
      ) : null}
      <div>
        <SearchModalBeta
          isOpen={isSearchModalBetaOpen || false}
          closeModalFn={() => closeModalActions()}
          inputQuery={searchBetaModalQuery}
        />
        <UploaderModalWrapper
          isOpen={isUploaderModalOpen || false}
          type=""
          closeModalFn={() => closeModalActions()}
        />
        <h2>Actions</h2>
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
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default EntryPage;
