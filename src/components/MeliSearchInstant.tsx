'use client';

import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import type { SearchClient } from 'instantsearch.js';
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
      const { searchClient: meliSearchClient } = instantMeiliSearch(
        process.env.NEXT_PUBLIC_MEILI_HOST!, // Host
        tokenData, // API key,
        {
          placeholderSearch: false, // default: true.
        },
      );

      setSearchClient(meliSearchClient);
    };

    fetchToken();
  }, []);

  return searchClient ? (
    <InstantSearch searchClient={searchClient} indexName="commonbase_prod">
      <SearchBox />
      <Hits />
    </InstantSearch>
  ) : null;
};

export default MeliSearchInstant;
