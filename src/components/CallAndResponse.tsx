'use client';

// import './CallAndResponse.css';

import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { addEntry, fetchByID, updateEntry } from '@/helpers/functions';

type Entry = {
  id: string;
  data: string;
  metadata: any; // parsed json
  createdAt?: string;
  updatedAt?: string;
};

type Props = {
  allEntries: Entry[];
  updateAllEntries: (entry: Entry) => void;
  autoAddInstance: () => void;
};

const CallAndResponse: React.FC<Props> = ({
  allEntries,
  updateAllEntries,
  autoAddInstance,
}) => {
  const [entries, setEntries] = useState<Entry[]>([...allEntries]);
  const [matches, setMatches] = useState<Entry[]>([]);
  const [searchResults, setSearchResults] = useState<Entry[]>([]);
  const [text, setText] = useState('');
  const [parentDisplay, setParentDisplay] = useState<{ [key: string]: Entry }>(
    {},
  );
  const [submitted, setSubmitted] = useState(false);
  const [instanceAdded, setInstanceAdded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleAdd = async (focused: Entry | null) => {
    const metadata = {
      title: 'Flow State',
      author: 'https://ycb-companion.onrender.com/dashboard',
    };
    if (!focused) {
      console.log('adding new entry');
      const data = text;
      const response = await addEntry(data, metadata);

      setEntries([...entries, response.respData]);
      updateAllEntries(response.respData);
      if (!instanceAdded) {
        autoAddInstance();
        setInstanceAdded(true);
      }
      console.log('response:', response);
      console.log('response.respData:', response.respData);
      return response.respData;
    }
    console.log('focused:', focused);
    let inputMetadata = focused.metadata;
    try {
      inputMetadata =
        typeof focused.metadata === 'string'
          ? JSON.parse(focused.metadata)
          : focused.metadata;
    } catch (error) {
      // no-op
    }

    console.log('inputMetadata:', inputMetadata);
    if (inputMetadata && 'parent_id' in inputMetadata) {
      const parentId = inputMetadata.parent_id;
      (metadata as any).parent_id = parentId;
    } else {
      (metadata as any).parent_id = focused.id;
    }

    const data = text;
    // Add to YCB
    const response = await addEntry(data, metadata);
    const childId = response.respData.id;

    console.log('childid:', childId);

    // Update the parent entry
    const parentId = (metadata as any).parent_id;
    console.log('parentId:', parentId);
    const parentEntry = await fetchByID(parentId);
    let parentEntryMetadata = parentEntry.metadata;
    try {
      parentEntryMetadata =
        typeof parentEntry.metadata === 'string'
          ? JSON.parse(parentEntry.metadata)
          : parentEntry.metadata;
    } catch (error) {
      // no-op
    }

    const updatedParentEntry = {
      ...parentEntry,
      metadata: {
        ...parentEntryMetadata,
        alias_ids: [...(parentEntryMetadata.alias_ids || []), childId],
      },
    };

    const response2 = await updateEntry(
      updatedParentEntry.id,
      updatedParentEntry.data,
      updatedParentEntry.metadata,
    );

    setEntries([...entries, response2.respData]);
    updateAllEntries(response2.respData);
    if (!instanceAdded) {
      autoAddInstance();
      setInstanceAdded(true);
    }

    return response2.respData;
  };

  const handleSubmit = async () => {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: text,
        match_count: 5,
      }),
    });

    const respData = await response.json();
    const { data } = respData;

    // For each result, if metadata.parent_id exists, fetch the parent entry
    const fetchParentEntries = data.map(async (result: any) => {
      let metadata;
      try {
        metadata =
          typeof result.metadata === 'string'
            ? JSON.parse(result.metadata)
            : result.metadata;
      } catch (err) {
        metadata = result.metadata;
      }
      if (metadata && metadata.parent_id) {
        const parentResult = await fetchByID(metadata.parent_id);
        return { id: result.id, parentResult };
      }
      return null;
    });

    const results = await Promise.allSettled(fetchParentEntries);

    results.forEach((res) => {
      if (res.status === 'fulfilled' && res.value) {
        const { id, parentResult } = res.value;
        setParentDisplay((prev) => ({
          ...prev,
          [id]: parentResult,
        }));
      }
    });

    if (allEntries.length === 0) {
      const responseEntry = await handleAdd(null);
      console.log('responseEntry:', responseEntry);
      console.log('sessionStarter:', responseEntry);
    } else {
      const sessionStarter = allEntries[0];
      await handleAdd(sessionStarter!);
    }

    setSearchResults(data);
    setSubmitted(true);
  };

  useEffect(() => {
    const updateMatches = () => {
      const uniqueMatches = Array.from(
        new Set(searchResults.map((m) => JSON.stringify(m))),
      ).map((s) => JSON.parse(s));
      setMatches(uniqueMatches);
    };
    updateMatches();
  }, [searchResults]);

  // function formatTimestamp(timestamp: string) {
  //   const date = new Date(timestamp);
  //   const options: Intl.DateTimeFormatOptions = {
  //     year: 'numeric',
  //     month: 'long',
  //     day: 'numeric',
  //     hour: 'numeric',
  //     minute: 'numeric',
  //     hour12: true,
  //   };
  //   return date.toLocaleString('en-US', options);
  // }

  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

  const [addedStates, setAddedStates] = useState<{
    [key: string]: boolean;
  }>({});

  const handleAddWithLoading = async (entry: Entry) => {
    setLoadingStates((prev) => ({ ...prev, [entry.id]: true }));
    await handleAdd(entry);
    setLoadingStates((prev) => ({ ...prev, [entry.id]: false }));
    setAddedStates((prev) => ({ ...prev, [entry.id]: true }));
  };

  const getButtonText = (loading: boolean, added: boolean) => {
    if (loading) return 'Loading...';
    if (added) return 'Added';
    return 'Add as Comment';
  };
  const [setSubmitting, setSetSubmitting] = useState(false);
  

  return (
    <div className="call-and-response">
      <textarea
        className="m-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your thoughts here"
        rows={5}
      />
      <button
        onClick={async () => {
          setSetSubmitting(true);
          await handleSubmit();
          setSetSubmitting(false);
          
        }}
        className={`m-2 me-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 ${setSubmitting ? 'cursor-not-allowed' : ''}`}
        disabled={setSubmitting}
        type="button"
      >
        {setSubmitting ? 'Submitting...' : 'Submit'}
      </button>
      {allEntries.length > 0 && submitted && (
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          type="button"
        >
          {isDropdownOpen ? 'Hide Entries' : 'Show Entries'}
        </button>
      )}
      {isDropdownOpen && allEntries.length > 0 && submitted && (
        <div>
          {allEntries.map((entry) => (
            <div
              key={entry.id}
              className="m-4 block w-full overflow-x-auto rounded-lg border border-gray-200 bg-white p-6 shadow hover:bg-gray-100"
            >
              <ReactMarkdown>{entry.data}</ReactMarkdown>
              {entry.metadata.title === 'Image' && (
                <img src={entry.metadata.author} alt="Image" />
              )}
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  onClick={async () => {
                    await handleAddWithLoading(entry);
                  }}
                  disabled={loadingStates[entry.id]}
                  className="rounded-s-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700"
                >
                  {getButtonText(
                    loadingStates[entry.id]!,
                    addedStates[entry.id]!,
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      `https://ycb-companion.onrender.com/dashboard/entry/${entry.id}`,
                      '_blank',
                    )
                  }
                  disabled={loadingStates[entry.id] || addedStates[entry.id]}
                  className={`rounded-s-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 ${loadingStates[entry.id] || addedStates[entry.id] ? 'cursor-not-allowed' : ''}`}
                >
                  Open in Companion
                </button>
              </div>
            </div>
          ))}
          <hr className="mx-auto my-4 h-1 w-48 rounded border-0 bg-gray-100 dark:bg-gray-700 md:my-10" />
        </div>
      )}

      {matches.length > 0 && submitted && (
        <div>
          {matches.map((match: any) => (
            <div key={match.id}>
              <div className="m-4 block w-full overflow-x-auto rounded-lg border border-gray-200 bg-white p-6 shadow hover:bg-gray-100">
                <ReactMarkdown>{match.data}</ReactMarkdown>
                <br />
                {match.metadata && match.metadata.title === 'Image' && (
                  <img src={match.metadata.author} alt="Image" />
                )}
                <br />
                {parentDisplay && parentDisplay[match.id] && (
                  <p>
                    <em>{parentDisplay[match.id]!.data}</em>
                  </p>
                )}

                <div className="inline-flex rounded-md shadow-sm" role="group">
                  <button
                    type="button"
                    onClick={async () => {
                      await handleAddWithLoading(match);
                    }}
                    disabled={loadingStates[match.id] || addedStates[match.id]}
                    className={`rounded-s-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 ${loadingStates[match.id] || addedStates[match.id] ? 'cursor-not-allowed' : ''}`}
                  >
                    {getButtonText(
                      loadingStates[match.id]!,
                      addedStates[match.id]!,
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        `https://ycb-companion.onrender.com/dashboard/entry/${match.id}`,
                        '_blank',
                      )
                    }
                    className="rounded-e-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700"
                  >
                    Open in Companion
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CallAndResponse;
