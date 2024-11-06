import { useEffect, useState } from 'react';

import { fetchByID } from '@/helpers/functions';

import ForceDirectedGraph from './ForceDirectedGraph';

const ForceFromEntry = ({ inputEntry }: { inputEntry: any }) => {
  const [fData, setFData] = useState<any>({
    neighbors: [],
    comments: [],
    internalLinks: [],
  });

  const searchNeighbors = async (query: string, skipIDS: string[] = []) => {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        matchCount: 6,
      }),
    });
    const res = await response.json();
    const neighbors = [];
    for await (const neighbor of res.data) {
      if (skipIDS.includes(neighbor.id)) {
        // skip
      } else {
        if (JSON.parse(neighbor.metadata).parent_id) {
          const parent = await fetchByID(
            JSON.parse(neighbor.metadata).parent_id,
          );
          neighbor.parent = parent;
        }
        // if metadata.author includes imagedelivery.net, add it to the thumbnails array
        if (JSON.parse(neighbor.metadata).author) {
          if (
            JSON.parse(neighbor.metadata).author.includes('imagedelivery.net')
          ) {
            neighbor.image = JSON.parse(neighbor.metadata).author;
          }
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
        matchCount: 6,
      }),
    });
    const res = await response.json();
    const penPals = [];

    // for pen pals if metadata.parent_id is not null, add it to the pen pals array fetch the parent entry and add it to the pen pal as a parent

    for await (const penPal of res.data) {
      if (skipIDS.includes(penPal.id)) {
        // skip
      } else if (penPal.similarity === 1.01) {
        // skip
      } else {
        if (JSON.parse(penPal.metadata).parent_id) {
          const parent = await fetchByID(JSON.parse(penPal.metadata).parent_id);
          penPal.parent = parent;
        }
        if (JSON.parse(penPal.metadata).author) {
          if (
            JSON.parse(penPal.metadata).author.includes('imagedelivery.net')
          ) {
            penPal.image = JSON.parse(penPal.metadata).author;
          }
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
        matchCount: 6,
      }),
    });
    const res = await response.json();

    const internalLinks = [];

    // for internal links if metadata.parent_id is not null, add it to the internalLinks array fetch the parent entry and add it to the internalLinks as a parent

    for await (const internalLink of res.data) {
      if (skipIDS.includes(internalLink.id)) {
        // skip
      } else if (internalLink.similarity === 1.01) {
        // skip
      } else {
        if (JSON.parse(internalLink.metadata).parent_id) {
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
        }
        internalLinks.push(internalLink);
      }
    }

    return internalLinks;
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
      if (!inputEntry) return;
      setFData({
        entry: inputEntry.data,
        neighbors: [],
        comments: [],
        internalLinks: [],
      });
      await generateFData(inputEntry, inputEntry.metadata.aliasData);
    };
    asyncFn();
  }, [inputEntry]);
  return <ForceDirectedGraph data={fData} />;
};

export default ForceFromEntry;
