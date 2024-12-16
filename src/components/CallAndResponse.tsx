'use client';

// import './CallAndResponse.css';

import React, { useEffect, useState } from 'react';

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

  // const fetchById = async (id: string) => {
  //   const response = await fetch('/api/fetch', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       id,
  //     }),
  //   });

  //   const data = await response.json();
  //   return data;
  // };

  // const addToYCB = async (inputData: string, inputMetadata: any) => {
  //   const response = await fetch('/api/add', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       data: inputData,
  //       metadata: inputMetadata,
  //     }),
  //   });

  //   const data = await response.json();
  //   return data;
  // };

  // const updateById = async (
  //   id: string,
  //   inputData: string,
  //   inputMetadata: any,
  // ) => {
  //   const response = await fetch('/api/update', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       id,
  //       data: inputData,
  //       metadata: inputMetadata,
  //     }),
  //   });

  //   const data = await response.json();
  //   return data;
  // };

  useEffect(() => {
    const updateMatches = () => {
      const uniqueMatches = Array.from(
        new Set(searchResults.map((m) => JSON.stringify(m))),
      ).map((s) => JSON.parse(s));
      setMatches(uniqueMatches);
    };
    updateMatches();
  }, [searchResults]);

  function formatTimestamp(timestamp: string) {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    };
    return date.toLocaleString('en-US', options);
  }

  return (
    <div className="call-and-response">
      <textarea
        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your thoughts here"
        rows={5}
      />
      <button onClick={handleSubmit} className="submit-button" type="button">
        Submit
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
            <div key={entry.id}>
              {entry.data}
              {entry.metadata.title === 'Image' && (
                <img src={entry.metadata.author} alt="Image" />
              )}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      `https://ycb-companion.onrender.com/dashboard/entry/${entry.id}`,
                      '_blank',
                    )
                  }
                >
                  Open in Companion
                </button>
                <button type="button" onClick={() => handleAdd(entry)}>
                  Add as Comment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {matches.length > 0 && submitted && (
        <div>
          {matches.map((match: any) => (
            <div key={match.id}>
              <div>
                {match.data}
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
              </div>
              <div>
                <div>
                  <button type="button">&#x22EE;</button>
                  <div>
                    <button
                      onClick={() =>
                        window.open(
                          `https://ycb-companion.onrender.com/dashboard/entry/${match.id}`,
                          '_blank',
                        )
                      }
                      type="button"
                    >
                      Open in Companion
                    </button>
                    <button type="button" onClick={() => handleAdd(match)}>
                      Add as Comment
                    </button>
                  </div>
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
