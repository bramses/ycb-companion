"use client";

import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import { SearchClient } from 'instantsearch.js';
import { useEffect, useState } from 'react';
import { Hits, InstantSearch, SearchBox } from 'react-instantsearch';



const MeliSearchInstant = () => {

  const [searchClient, setSearchClient] = useState<SearchClient | null>(null);

  useEffect(() => {

    const fetchToken = async () => {
      const token = await fetch('/api/searchToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const tokenData = await token.json();
      const { searchClient } = instantMeiliSearch(
        'https://meili-i59l.onrender.com', // Host
        tokenData, // API key,
        {
          placeholderSearch: false, // default: true.
        },
      );
  
      setSearchClient(searchClient);
    };
  
    fetchToken();
    
  }, []);
    

  return (
    searchClient ? <InstantSearch searchClient={searchClient} indexName="pg_rollover">
      <SearchBox />
      <Hits />
    </InstantSearch> : null
  );
};

export default MeliSearchInstant;
