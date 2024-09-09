import type { Dispatch, SetStateAction } from 'react';

export const fetchByID = async (entryId: string) => {
  const response = await fetch('/api/fetch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: entryId,
    }),
  });

  const resData = await response.json();

  const entry = resData.data;
  // parse metadata
  const metadata = JSON.parse(entry.metadata);

  return {
    data: entry.data,
    metadata,
    id: entry.id,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
};

export async function fetchFavicon(url: string) {
  try {
    const response = await fetch(`/api/favicon?url=${url}`);
    const data = await response.json();
    return data;
  } catch (err) {
    return { favicon: '/favicon.ico' };
  }
}

export async function fetchSearchEntries(
  query: string,
  setSearchResults: Dispatch<SetStateAction<any[]>>,
) {
  const response = await fetch('/api/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  const data = await response.json();
  const entries = data.data;
  // map entries.metadata to json
  const parsedEntries = entries.map((entry: any) => {
    let metadata;
    try {
      metadata = JSON.parse(entry.metadata);
    } catch (err) {
      metadata = entry.metadata; // fallback to original metadata if parsing fails
    }

    return { ...entry, metadata, favicon: '/favicon.ico' };
  });

  // Return parsed entries immediately
  setSearchResults(parsedEntries);

  // for all entries with a parent_id, fetch parent_id data and append data as parentData key
  const parentPromises = parsedEntries.map((entry: any) => {
    if ('parent_id' in entry.metadata) {
      return fetchByID(entry.metadata.parent_id);
    }
    return Promise.resolve(null); // Return null for entries without parent_id
  });

  Promise.allSettled(parentPromises).then((results) => {
    const updatedEntries = parsedEntries.map((entry: any, index: any) => {
      if (!results[index]) {
        return entry;
      }
      if (results[index].status === 'fulfilled' && results[index].value) {
        return { ...entry, parentData: results[index].value };
      }
      return entry;
    });

    // Return updated entries immediately
    setSearchResults(updatedEntries);

    // fetch favicon for each entry
    const faviconPromises = updatedEntries.map((entry: any) => {
      if (!entry.metadata) {
        return { favicon: '/favicon.ico' };
      }

      return fetchFavicon(entry.metadata.author);
    });

    Promise.all(faviconPromises).then((favicons) => {
      const updatedEntriesFavicon = updatedEntries.map(
        (entry: any, index: any) => {
          const favicon = favicons[index].favicon
            ? favicons[index].favicon
            : '/favicon.ico';
          return { ...entry, favicon };
        },
      );

      // Update search results with favicons
      setSearchResults(updatedEntriesFavicon);
    });
  });

  return parsedEntries;
}

export async function fetchSearchEntriesOriginal(
  query: string,
  setSearchResults: Dispatch<SetStateAction<any[]>>,
) {
  const response = await fetch('/api/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  const data = await response.json();
  const entries = data.data;
  // map entries.metadata to json
  const parsedEntries = entries.map((entry: any) => {
    let metadata;
    try {
      metadata = JSON.parse(entry.metadata);
    } catch (err) {
      metadata = entry.metadata; // fallback to original metadata if parsing fails
    }

    return { ...entry, metadata, favicon: '/favicon.ico' };
  });

  // Return parsed entries immediately
  setSearchResults(parsedEntries);

  // for all entries with a parent_id, fetch parent_id data and append data as parentData key
  const parentPromises = parsedEntries.map((entry: any) => {
    if ('parent_id' in entry.metadata) {
      return fetchByID(entry.metadata.parent_id);
    }
    return Promise.resolve(null); // Return null for entries without parent_id
  });

  Promise.allSettled(parentPromises).then((results) => {
    const updatedEntries = parsedEntries.map((entry: any, index: any) => {
      if (!results[index]) {
        return entry;
      }
      if (results[index].status === 'fulfilled' && results[index].value) {
        return { ...entry, parentData: results[index].value };
      }
      return entry;
    });

    // Return updated entries immediately
    setSearchResults(updatedEntries);

    // fetch favicon for each entry
    const faviconPromises = updatedEntries.map((entry: any) => {
      if (!entry.metadata) {
        return { favicon: '/favicon.ico' };
      }

      return fetchFavicon(entry.metadata.author);
    });

    Promise.all(faviconPromises).then((favicons) => {
      const updatedEntriesFavicon = updatedEntries.map(
        (entry: any, index: any) => {
          const favicon = favicons[index].favicon
            ? favicons[index].favicon
            : '/favicon.ico';
          return { ...entry, favicon };
        },
      );

      // Update search results with favicons
      setSearchResults(updatedEntriesFavicon);
    });
  });

  return parsedEntries;
}

export const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleString(); // You can customize the locale and options as needed
};

export const addEntry = async (data: string, metadata: string) => {
  try {
    const response = await fetch('/api/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data,
        metadata,
      }),
    });
    const responseData = await response.json();

    // console.log('Added entry:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error adding entry:', error);
    return {};
  }
};

export const updateEntry = async (
  id: string,
  data: string,
  metadata: string,
) => {
  try {
    console.log('metadata:', metadata);
    console.log('metadata type:', typeof metadata);
    console.log('id:', id);
    console.log('data:', data);
    const response = await fetch('/api/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        data,
        metadata,
      }),
    });
    const responseData = await response.json();

    console.log('Updated entry:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error updating entry:', error);
    return {};
  }
};

export const handleAliasAdd = async (data: any) => {
  try {
    console.log('data [handleAliasAdd]:', data);
    const parentEntry = await fetchByID(data.id);
    console.log('parentEntry:', parentEntry);
    let parentAliases = parentEntry.metadata.alias_ids;
    try {
      parentAliases = JSON.parse(parentEntry.metadata).alias_ids;
    } catch (err) {
      console.error('Error parsing parent metadata:', err);
    }
    // add a new entry with the alias as data and the original entry's metadata
    // add parent_id to the metadata
    const parentId = data.id;
    const newMetadata = {
      ...data.metadata,
      parent_id: parentId,
    };
    const aliasRes = await addEntry(data.alias, newMetadata);
    console.log('aliasRes:', aliasRes);
    const aliasId = aliasRes.respData.id;
    // update the original entry's metadata with the new alias id in the alias_ids array
    const updatedMetadata = {
      ...data.metadata,
      alias_ids: parentAliases ? [parentAliases, aliasId].flat() : [aliasId],
    };
    console.log('updatedMetadata:', updatedMetadata);
    await updateEntry(parentId, data.data.data, updatedMetadata);

    return aliasRes;
  } catch (err) {
    console.error('Error adding alias:', err);
    return { error: err };
  }
};

export const splitIntoWords = (
  text: string,
  numWords: number,
  startIndex: number,
) => {
  const words = text.split(' ');
  if (startIndex) {
    return words.slice(startIndex, numWords + startIndex).join(' ');
  }
  return words.slice(0, numWords).join(' ');
};

export const addToCollection = (
  id: string,
  title: string,
  buildingCollection: boolean,
  setBuildingCollection: Dispatch<SetStateAction<boolean>>,
  setCheckedButtons: Dispatch<SetStateAction<{ [key: string]: boolean }>>,
) => {
  // add to collection
  // check if the id is already in the collection and skip if it is
  if (localStorage.getItem('buildingCollection')) {
    const collection = JSON.parse(
      localStorage.getItem('buildingCollection') as string,
    );
    if (collection.find((entry: any) => entry.id === id)) {
      return;
    }
    collection.push({
      id,
      title,
      link: `https://ycb-companion.onrender.com/dashboard/entry/${id}`,
    });
    localStorage.setItem('buildingCollection', JSON.stringify(collection));
  } else {
    if (!buildingCollection) setBuildingCollection(true);
    localStorage.setItem(
      'buildingCollection',
      JSON.stringify([
        {
          id,
          title,
          link: `https://ycb-companion.onrender.com/dashboard/entry/${id}`,
        },
      ]),
    );
  }
  setCheckedButtons((prev) => ({
    ...prev,
    [id]: !prev[id],
  }));
};

export const downloadCollection = (
  setCheckedButtons: Dispatch<SetStateAction<{ [key: string]: boolean }>>,
) => {
  const collection = JSON.parse(
    localStorage.getItem('buildingCollection') as string,
  );
  const blob = new Blob([JSON.stringify(collection, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `collection-${new Date().toLocaleDateString()}-${new Date().toLocaleTimeString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  localStorage.removeItem('buildingCollection');
  setCheckedButtons({});
};

export const fetchList = async (
  setSearchResults: Dispatch<SetStateAction<any[]>>,
  page: number,
  limit: number = 20,
  sortModel: any = [{ colId: 'updatedAt', sort: 'desc' }],
  filterModel: any = { items: [] },
) => {
  const response = await fetch(`/api/list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      page,
      limit,
      sortModel,
      filterModel,
    }),
  });

  const dataRes = await response.json();
  const entries = dataRes.data;

  const parsedEntries = entries.map((entry: any) => {
    let metadata;
    try {
      metadata = JSON.parse(entry.metadata);
    } catch (err) {
      metadata = entry.metadata; // fallback to original metadata if parsing fails
    }

    return { ...entry, metadata, favicon: '/favicon.ico' };
  });

  // Return parsed entries immediately
  setSearchResults(parsedEntries);

  // for all entries with a parent_id, fetch parent_id data and append data as parentData key
  const parentPromises = parsedEntries.map((entry: any) => {
    if ('parent_id' in entry.metadata) {
      return fetchByID(entry.metadata.parent_id);
    }
    return Promise.resolve(null); // Return null for entries without parent_id
  });

  Promise.allSettled(parentPromises).then((results) => {
    const updatedEntries = parsedEntries.map((entry: any, index: any) => {
      if (!results[index]) {
        return entry;
      }
      if (results[index].status === 'fulfilled' && results[index].value) {
        return { ...entry, parentData: results[index].value };
      }
      return entry;
    });

    // Return updated entries immediately
    setSearchResults(updatedEntries);

    // fetch favicon for each entry
    const faviconPromises = updatedEntries.map((entry: any) => {
      if (!entry.metadata) {
        return { favicon: '/favicon.ico' };
      }

      return fetchFavicon(entry.metadata.author);
    });

    Promise.all(faviconPromises).then((favicons) => {
      const updatedEntriesFavicon = updatedEntries.map(
        (entry: any, index: any) => {
          const favicon = favicons[index].favicon
            ? favicons[index].favicon
            : '/favicon.ico';
          return { ...entry, favicon };
        },
      );

      // Update search results with favicons
      setSearchResults(updatedEntriesFavicon);
    });
  });
};
