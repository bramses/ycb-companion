'use client';

import Fuse from 'fuse.js';
import { useEffect, useMemo, useRef, useState } from 'react';

import ImageUpload from '@/components/ImageUpload';
import { fetchRandomEntry } from '@/helpers/functions';

import LinkPreviewCard from './LinkPreview';

interface Entry {
  id: string;
  data: string;
  comments?: Entry[];
  createdAt: string;
  metadata: any;
}

interface ThreadEntryProps {
  entry: Entry;
  neighbors: { [key: string]: Entry[] };
  fetchNeighbors: (query: string, id: string) => void;
  idSet: React.MutableRefObject<Set<string>>;
  recordExpanded: (entry: Entry) => void;
  recordFetched: (entry: Entry) => void;
  type: 'root' | 'parent' | 'comment' | 'neighbor';
}

const ThreadEntry: React.FC<ThreadEntryProps> = ({
  entry,
  neighbors,
  fetchNeighbors,
  idSet,
  recordExpanded,
  recordFetched,
  type,
}) => {
  const [aliasComments, setAliasComments] = useState<Entry[]>([]);
  const [parentComment, setParentComment] = useState<Entry | null>(null);
  const [parentCommentLoaded, setParentCommentLoaded] = useState(false);
  const [aliasLoaded, setAliasLoaded] = useState(false);
  const [cdnImageUrl, setCdnImageUrl] = useState<string>('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isAddingURL, setIsAddingURL] = useState(false);
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [randomCommentPlaceholder, setRandomCommentPlaceholder] =
    useState('Add a comment...');

  const { metadata } = entry;
  // const { author } = metadata;
  // const { title } = metadata;
  const aliasIds: string[] = metadata.alias_ids || [];
  const parentId = metadata.parent_id || null;

  const commentsNotLoaded = aliasIds.filter((id) => !idSet.current.has(id));
  const parentNotLoaded = !idSet.current.has(parentId);

  useEffect(() => {
    // get random entry on load
    const asyncFn = async () => {
      const rentry = await fetchRandomEntry();
      setRandomCommentPlaceholder(rentry.data);
    };
    asyncFn();
  }, []);

  useEffect(() => {
    if (metadata.type === 'image') {
      const fetchData = async () => {
        const { id } = entry;
        const cdnResp = await fetch(`/api/fetchImageByIDs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ids: [id],
          }),
        });
        const cdnData = await cdnResp.json();

        setCdnImageUrl(
          cdnData.data.body.urls[id] ? cdnData.data.body.urls[id] : '',
        );
      };

      fetchData();
    }
  }, [metadata.type]);

  const handleToggle = async (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    const details = e.currentTarget;
    if (details.open) {
      recordExpanded(entry);
      if (!neighbors[entry.id]) {
        fetchNeighbors(entry.data, entry.id);
      }
      if (parentId && !parentCommentLoaded && !idSet.current.has(parentId)) {
        const parent = await fetch('/api/fetch', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ id: parentId }),
        });
        const data = await parent.json();

        if (!idSet.current.has(parentId)) {
          idSet.current.add(parentId);
          recordFetched(data.data);
        }

        setParentComment(data.data);
        setParentCommentLoaded(true);
      }
      if (aliasIds.length && !aliasLoaded) {
        const fetchedComments: any[] = await Promise.all(
          aliasIds.map(async (aliasId) => {
            try {
              const res = await fetch('/api/fetch', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ id: aliasId }),
              });
              const data = await res.json();
              const entries: Entry[] = Array.isArray(data.data)
                ? data.data
                : [data.data];
              return entries.filter((aliasEntry) => {
                if (!idSet.current.has(aliasEntry.id)) {
                  idSet.current.add(aliasEntry.id);
                  recordFetched(aliasEntry);
                  return true;
                }
                return false;
              });
            } catch (error) {
              console.error('error fetching alias comments:', error);
              return [];
            }
          }),
        );

        // Flatten the fetchedComments array
        setAliasComments(fetchedComments.flat());
        setAliasLoaded(true);
      }
    }
  };

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

  function timeAgo(dateString: string) {
    const now = Date.now();
    const then = new Date(dateString).getTime();
    const seconds = Math.floor((now - then) / 1000);

    const intervals = [
      { label: 'year', secs: 31536000 },
      { label: 'month', secs: 2592000 },
      { label: 'week', secs: 604800 },
      { label: 'day', secs: 86400 },
      { label: 'hour', secs: 3600 },
      { label: 'minute', secs: 60 },
      { label: 'second', secs: 1 },
    ];

    for (const { label, secs } of intervals) {
      const count = Math.floor(seconds / secs);
      if (count >= 1) {
        return `${count} ${label}${count > 1 ? 's' : ''} ago`;
      }
    }

    return 'just now';
  }

  // turn isodate into form mm-dd-yyyy
  function convertDate(date: string) {
    const dateParts = date.split('T');
    const dateParts2 = dateParts[0]!.split('-');
    return `${dateParts2[1]}-${dateParts2[2]}-${dateParts2[0]}`;
  }

  const addComment = async (
    aliasInput: string,
    parent: { id: string; data: string; metadata: any },
  ) => {
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
        parent_id: parent.id,
      }),
    });

    const addedCommentRespData = await addedComment.json();
    const addedCommentData = addedCommentRespData.respData;

    // const parentRes = await fetchByID(parent.id);
    // let parentResMetadata = parentRes.metadata;
    // try {
    //   parentResMetadata = parentRes.metadata;
    // } catch (err) {
    //   console.error('Error parsing parent metadata:', err);
    // }
    // if (parentResMetadata.alias_ids) {
    //   parentResMetadata.alias_ids = [
    //     ...parentResMetadata.alias_ids,
    //     addedCommentData.id,
    //   ];
    // } else {
    //   parentResMetadata.alias_ids = [addedCommentData.id];
    // }

    // await apiUpdateEntry(parent.id, parent.data, {
    //   ...parentResMetadata,
    // });

    // setIsSaving(false);

    // setIsGraphLoading(true);

    // TODO check if this is still needed
    // const checkEmbeddingsWithDelay = async (
    //   entryId: string,
    //   maxTries: number,
    //   currentTry = 0,
    // ): Promise<boolean> => {
    //   if (currentTry >= maxTries) return false;
    //   const allEmbeddingsComplete = await checkForEmbeddings(entryId, []);
    //   if (allEmbeddingsComplete) return true;
    //   await new Promise<void>((resolve) => {
    //     setTimeout(resolve, 1000);
    //   });
    //   return checkEmbeddingsWithDelay(entryId, maxTries, currentTry + 1);
    // };

    // const allEmbeddingsComplete = await checkEmbeddingsWithDelay(
    //   addedCommentData.id,
    //   10,
    // );

    // if (!allEmbeddingsComplete) {
    //   console.log('Embeddings not complete after 10 tries -- try again later');
    //   alert('Failed to complete embeddings. Please try again later.');
    //   // Optionally, you can redirect the user or take other actions
    // }

    setAliasComments((prev) => [
      ...prev,
      {
        id: addedCommentData.id,
        data: aliasInput,
        comments: [],
        createdAt: addedCommentData.createdAt, // adjust field names as needed
        metadata: {
          ...parent.metadata,
          parent_id: parent.id,
          title: parent.metadata.title,
          author: parent.metadata.author,
        },
      },
    ]);

    idSet.current.add(addedCommentData.id);
    recordFetched(addedCommentData);

    // extend the force directed graph with the new comment
    // get pen pals
    // todo the switch of the order of update and fetchByID is causing the graph to not update correctly
    // const penPals = await searchPenPals(addedCommentData.id, [
    //   parent.id,
    //   addedCommentData.id,
    // ]);
    // setFData((prevData: any) => ({
    //   ...prevData,
    //   comments: [
    //     ...(prevData.comments || []),
    //     { comment: aliasInput, penPals, id: addedCommentData.id },
    //   ],
    // }));

    // setIsGraphLoading(false);
  };

  const addURL = async (
    url: string,
    parent: { id: string; data: string; metadata: any },
  ) => {
    const addedComment = await fetch(`/api/addURL`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        metadata: {
          parent_id: entry.id,
        },
      }),
    });

    const addedCommentRespData = await addedComment.json();
    const addedCommentData = addedCommentRespData.respData;

    // const parentRes = await fetchByID(parent.id);
    // let parentResMetadata = parentRes.metadata;
    // try {
    //   parentResMetadata = parentRes.metadata;
    // } catch (err) {
    //   console.error('Error parsing parent metadata:', err);
    // }
    // if (parentResMetadata.alias_ids) {
    //   parentResMetadata.alias_ids = [
    //     ...parentResMetadata.alias_ids,
    //     addedCommentData.id,
    //   ];
    // } else {
    //   parentResMetadata.alias_ids = [addedCommentData.id];
    // }

    // await apiUpdateEntry(parent.id, parent.data, {
    //   ...parentResMetadata,
    // });

    // setIsSaving(false);

    // setIsGraphLoading(true);

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
    }

    setAliasComments((prev) => [
      ...prev,
      {
        id: addedCommentData.id,
        data: addedCommentData.data,
        comments: [],
        createdAt: addedCommentData.createdAt, // adjust field names as needed
        metadata: {
          ...parent.metadata,
          parent_id: parent.id,
          title: parent.metadata.title,
          author: parent.metadata.author,
        },
      },
    ]);

    idSet.current.add(addedCommentData.id);
    recordFetched(addedCommentData);
    setIsAddingURL(false);
  };

  const getColor = (colortype: string) => {
    if (colortype === 'parent') return 'purple';
    if (colortype === 'comment') return 'coral';
    return 'black';
  };

  return (
    <details
      style={{ marginLeft: '20px', marginTop: '10px' }}
      onToggle={handleToggle}
    >
      <summary style={{ cursor: 'pointer' }}>
        <span
          style={{
            color: getColor(type),
          }}
        >
          {cdnImageUrl === '' &&
          !(
            (entry.metadata.ogTitle || entry.metadata.ogDescription) &&
            entry.metadata.ogImages &&
            entry.metadata.ogImages.length > 0
          )
            ? entry.data
            : ''}
          {metadata.type === 'image' ? (
            <img src={cdnImageUrl} alt="author" />
          ) : (
            ''
          )}
        </span>{' '}
        {commentsNotLoaded.length > 0 && (
          <span className="text-sm">({commentsNotLoaded.length} comments)</span>
        )}
        {parentNotLoaded && <span>(has parent)</span>}
        <a
          href={`/dashboard/garden?date=${convertDate(entry.createdAt)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          <em>{timeAgo(entry.createdAt)}</em>
        </a>
        {!entry.metadata.author.includes('yourcommonbase.com') &&
          (entry.metadata.ogTitle || entry.metadata.ogDescription) &&
          entry.metadata.ogImages &&
          entry.metadata.ogImages.length > 0 && (
            <LinkPreviewCard
              url={entry.metadata.author}
              title={entry.metadata.ogTitle}
              description={entry.metadata.ogDescription}
              image={entry.metadata.ogImages[0]}
            />
          )}
      </summary>
      <button
        onClick={() => setIsAddingComment(true)}
        type="button"
        className="ml-2 text-blue-600 hover:underline"
      >
        Add Comment
      </button>
      <button
        onClick={() => setIsAddingImage(true)}
        type="button"
        className="ml-2 text-blue-600 hover:underline"
      >
        Add Image
      </button>
      <button
        onClick={() => setIsAddingURL(true)}
        type="button"
        className="ml-2 text-blue-600 hover:underline"
      >
        Add URL
      </button>
      {isAddingImage && <ImageUpload metadata={{ parent_id: entry.id }} />}
      {isAddingURL && (
        <div>
          <input
            type="text"
            placeholder="https://yourcommonbase.com/dashboard"
            className="w-full rounded border border-neutral-dark bg-white px-4 py-2 pr-10 text-neutral-dark"
            style={{ fontSize: '17px' }}
            id={`link-input-comment-${entry.id}`}
          />
          <button
            onClick={() => {
              const url = document.getElementById(
                `link-input-comment-${entry.id}`,
              );
              if (!url) return;
              const urlValue = (url as HTMLInputElement).value.trim();
              if (!urlValue) return;
              addURL(urlValue, entry);
            }}
            type="button"
            className="ml-2 text-blue-600 hover:underline"
          >
            Add URL
          </button>
        </div>
      )}
      {isAddingComment && (
        <div className="flex">
          <textarea
            rows={3}
            style={{ fontSize: '17px' }}
            className="w-full rounded border border-neutral-dark bg-white px-4 py-2 pr-10 text-neutral-dark"
            placeholder={randomCommentPlaceholder}
            // onKeyDown={(e) => {
            //   if (e.key === 'Enter') {
            //     e.preventDefault();
            //     const aliasInput = document.getElementById(
            //       'alias-input-comment',
            //     );
            //     if (!aliasInput) return;
            //     const alias = (aliasInput as HTMLInputElement).value.trim();
            //     if (!alias) return;
            //     addCommentV2(alias, {
            //       id: entry.id,
            //       data: entry.data,
            //       metadata: entry.metadata,
            //     });
            //     (aliasInput as HTMLInputElement).value = '';
            //   }
            // }}
            id={`alias-input-comment-${entry.id}`}
          />
          <button
            type="button"
            onClick={() => {
              const aliasInput = document.getElementById(
                `alias-input-comment-${entry.id}`,
              );
              if (!aliasInput) return;
              const alias = (aliasInput as HTMLInputElement).value.trim();
              if (!alias) return;
              console.log('alias:', alias);
              console.log('parent:', entry.data);
              addComment(alias, {
                id: entry.id,
                data: entry.data,
                metadata: entry.metadata,
              });
              (aliasInput as HTMLInputElement).value = '';

              setIsAddingComment(false);
            }}
            className="rounded-full border border-neutral-light bg-neutral-light px-3 pb-1 text-xl text-neutral-dark focus:border-brand focus:ring-brand"
            aria-label="add alias"
          >
            +
          </button>
        </div>
      )}
      {aliasComments.map((comment) => (
        <ThreadEntry
          key={`${comment.id}-key`}
          entry={comment}
          neighbors={neighbors}
          fetchNeighbors={fetchNeighbors}
          idSet={idSet}
          recordExpanded={recordExpanded}
          recordFetched={recordFetched}
          type="comment"
        />
      ))}
      {parentComment && (
        <ThreadEntry
          key={`${parentComment.id}-key`}
          entry={parentComment}
          neighbors={neighbors}
          fetchNeighbors={fetchNeighbors}
          idSet={idSet}
          recordExpanded={recordExpanded}
          recordFetched={recordFetched}
          type="parent"
        />
      )}
      {neighbors[entry.id] &&
        neighbors[entry.id]!.map((child) => (
          <ThreadEntry
            key={`${child.id}-key`}
            entry={child}
            neighbors={neighbors}
            fetchNeighbors={fetchNeighbors}
            idSet={idSet}
            recordExpanded={recordExpanded}
            recordFetched={recordFetched}
            type="neighbor"
          />
        ))}
    </details>
  );
};

interface FuseResultWithMatches {
  item: Entry;
  matches?: Array<{ key: string; indices: [number, number][] }>;
}

export default function Thread({ inputId }: { inputId: string }) {
  const [parent, setParent] = useState<Entry | null>(null);
  const [neighbors, setNeighbors] = useState<{ [key: string]: Entry[] }>({});
  const [expandedEntries, setExpandedEntries] = useState<Entry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<FuseResultWithMatches[]>(
    [],
  );
  const [fetchedEntries, setFetchedEntries] = useState<{
    [key: string]: Entry;
  }>({});
  const idSet = useRef(new Set<string>());

  useEffect(() => {
    console.log('expandedEntries:', expandedEntries);
  }, [expandedEntries]);

  const recordFetched = (entry: Entry) => {
    setFetchedEntries((prev) => {
      if (prev[entry.id]) return prev;
      return { ...prev, [entry.id]: entry };
    });
  };

  const recordExpanded = (entry: Entry) => {
    setExpandedEntries((prev) => {
      if (prev.some((e) => e.id === entry.id)) return prev;
      return [...prev, entry];
    });
  };
  const fetchNeighbors = async (query: string, id: string) => {
    try {
      console.log('fetching neighbors for', `${id} query: ${query}`);
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ platformId: id }),
      });
      const data = await res.json();
      const newNeighbors: Entry[] = data.data.filter((entry: Entry) => {
        if (idSet.current.has(entry.id)) return false;
        idSet.current.add(entry.id);
        recordFetched(entry);
        return true;
      });
      setNeighbors((prev) => ({ ...prev, [id]: newNeighbors }));
    } catch (error) {
      console.error('error fetching neighbors:', error);
    }
  };

  // const fetchRandom = async () => {
  //   try {
  //     const res = await fetch('/api/random', {
  //       method: 'POST',
  //       headers: { 'content-type': 'application/json' },
  //     });
  //     const data = await res.json();
  //     const entry = data.entries[0];
  //     if (!idSet.current.has(entry.id)) {
  //       idSet.current.add(entry.id);
  //       recordFetched(entry);
  //     }
  //     setParent(entry);
  //     setExpandedEntries([]);
  //     if (entry.comments && entry.comments.length) {
  //       const validComments = entry.comments.filter((comment: Entry) => {
  //         if (idSet.current.has(comment.id)) return false;
  //         idSet.current.add(comment.id);
  //         recordFetched(comment);
  //         return true;
  //       });
  //       setNeighbors((prev) => ({ ...prev, [entry.id]: validComments }));
  //     }
  //     fetchNeighbors(entry.data, entry.id);
  //   } catch (error) {
  //     console.error('error fetching random:', error);
  //   }
  // };

  useEffect(() => {
    // fetch id in props and set it as the parent
    const fetchEntry = async () => {
      try {
        const res = await fetch('/api/fetch', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ id: inputId }),
        });
        const data = await res.json();
        const entry = data.data;
        if (!idSet.current.has(entry.id)) {
          idSet.current.add(entry.id);
          recordFetched(entry);
        }
        setParent(entry);
        setExpandedEntries([]);
        if (entry.comments && entry.comments.length) {
          const validComments = entry.comments.filter((comment: Entry) => {
            if (idSet.current.has(comment.id)) return false;
            idSet.current.add(comment.id);
            recordFetched(comment);
            return true;
          });
          setNeighbors((prev) => ({ ...prev, [entry.id]: validComments }));
        }
        fetchNeighbors(entry.data, entry.id);
      } catch (error) {
        console.error('error fetching random:', error);
      }
    };
    fetchEntry();
  }, []);

  const allFetchedEntries = useMemo(
    () => Object.values(fetchedEntries),
    [fetchedEntries],
  );

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }
    const fuse = new Fuse(allFetchedEntries, {
      keys: ['data', 'metadata'],
      includeMatches: true,
      // // loosen these so partial matches are more likely to be found:
      threshold: 0.25, // default is 0.6, try 0.4–0.6
      // distance: 10000,     // let it match text far apart
      ignoreLocation: true, // skip exact positioning
      minMatchCharLength: 4,
      // findAllMatches: true // find all matches, not just best
    });
    const results = fuse.search<Entry>(searchTerm) as FuseResultWithMatches[];
    setSearchResults(results);
  }, [searchTerm, allFetchedEntries]);

  const highlightText = (text: string, indices: [number, number][]) => {
    if (!indices || indices.length === 0) return text;
    const result = [];
    let lastIndex = 0;
    indices.forEach(([start, end]) => {
      if (start > lastIndex) {
        result.push(
          <span key={lastIndex}>{text.slice(lastIndex, start)}</span>,
        );
      }
      result.push(<mark key={start}>{text.slice(start, end + 1)}</mark>);
      lastIndex = end + 1;
    });
    if (lastIndex < text.length) {
      result.push(<span key={lastIndex}>{text.slice(lastIndex)}</span>);
    }
    return result;
  };

  return (
    <div>
      {parent && (
        <div style={{ marginTop: '10px' }}>
          <ThreadEntry
            entry={parent}
            neighbors={neighbors}
            fetchNeighbors={fetchNeighbors}
            idSet={idSet}
            recordExpanded={recordExpanded}
            recordFetched={recordFetched}
            type="root"
          />
        </div>
      )}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          width: '100%',
          background: '#fff',
          padding: '10px',
          borderTop: '1px solid #ccc',
        }}
      >
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="search..."
          style={{ width: '100%', padding: '8px' }}
        />
        {searchResults.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '5px' }}>
            {searchResults.map((result) => {
              const dataMatch = result.matches?.find((m) => m.key === 'data');
              return (
                <li
                  key={`${result.item.id}-key`}
                  style={{ marginBottom: '5px' }}
                >
                  <a
                    href={`/dashboard/entry/${result.item.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'underline', color: 'blue' }}
                  >
                    {dataMatch
                      ? highlightText(result.item.data, dataMatch.indices)
                      : result.item.data}
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
