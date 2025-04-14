'use client';

import Fuse from 'fuse.js';
import { useEffect, useMemo, useRef, useState } from 'react';

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
}

const ThreadEntry: React.FC<ThreadEntryProps> = ({
  entry,
  neighbors,
  fetchNeighbors,
  idSet,
  recordExpanded,
  recordFetched,
}) => {
  const [aliasComments, setAliasComments] = useState<Entry[]>([]);
  const [aliasLoaded, setAliasLoaded] = useState(false);

  const { metadata } = entry;
  const { author } = metadata;
  const { title } = metadata;
  const aliasIds: string[] = metadata.alias_ids || [];

  const handleToggle = async (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    const details = e.currentTarget;
    if (details.open) {
      recordExpanded(entry);
      if (!neighbors[entry.id]) {
        fetchNeighbors(entry.data, entry.id);
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

  return (
    <details
      style={{ marginLeft: '20px', marginTop: '10px' }}
      onToggle={handleToggle}
    >
      <summary style={{ cursor: 'pointer' }}>
        {entry.data}{' '}
        <a
          href={`https://ycb-companion.onrender.com/dashboard/entry/${entry.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          <em>
            (by{' '}
            {author.includes('https://imagedelivery.net') ? (
              <img src={author} alt="author" />
            ) : (
              title
            )}{' '}
            on {new Date(entry.createdAt).toLocaleString()})
          </em>
        </a>
      </summary>
      {aliasComments.map((comment) => (
        <ThreadEntry
          key={`${comment.id}-key`}
          entry={comment}
          neighbors={neighbors}
          fetchNeighbors={fetchNeighbors}
          idSet={idSet}
          recordExpanded={recordExpanded}
          recordFetched={recordFetched}
        />
      ))}
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
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query }),
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

  const copyMarkdown = async () => {
    const md = expandedEntries
      .map((entry, idx) => {
        const meta = entry.metadata;
        const { title } = meta;
        return `${idx + 1}. [${entry.data} - ${title}](https://ycb-companion.onrender.com/dashboard/entry/${entry.id})`;
      })
      .join('\n');
    try {
      await navigator.clipboard.writeText(md);
      alert('markdown copied to clipboard!');
    } catch (error) {
      console.error('copy error:', error);
    }
  };

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
      <div style={{ marginBottom: '10px' }}>
        <button
          onClick={copyMarkdown}
          type="button"
          className="btn btn-secondary rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          copy markdown
        </button>
      </div>
      {parent && (
        <div style={{ marginTop: '10px' }}>
          <ThreadEntry
            entry={parent}
            neighbors={neighbors}
            fetchNeighbors={fetchNeighbors}
            idSet={idSet}
            recordExpanded={recordExpanded}
            recordFetched={recordFetched}
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
                    href={`https://ycb-companion.onrender.com/dashboard/entry/${result.item.id}`}
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
