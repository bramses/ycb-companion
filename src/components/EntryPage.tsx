'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface EntryPageProps {
  initialData?: { data: any; metadata: any } | null;
}

const EntryPage = ({ initialData = null }: EntryPageProps) => {
  // fetch data from the server at id on load
  const [data, setData] = useState<{ data: any; metadata: any } | null>(
    initialData,
  );
  const pathname = usePathname();

  const fetchByID = async (entryId: string) => {
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
    };
  };

  useEffect(() => {
    if (!data) {
      const asyncFn = async () => {
        // get id from pathname by popping the last element
        const id = pathname.split('/').pop();
        if (!id) return;
        const entryId = Array.isArray(id) ? id[0] : id; // Handle both string and string[]
        if (!entryId) return;
        let res;
        const dt = await fetchByID(entryId);

        if ('parent_id' in dt.metadata) {
          const parentData = await fetchByID(dt.metadata.parent_id);
          // set res to parentData
          res = parentData;
        }
        // set res to dt if parentData is not available
        res = res || dt;

        if ('alias_ids' in res.metadata) {
          // fetch plaintext data from alias_ids
          Promise.all(
            res.metadata.alias_ids.map((aliasId: string) => fetchByID(aliasId)),
          ).then((aliasData) => {
            // replace alias_ids with aliasData
            res.metadata.alias_ids = aliasData.map((ad) => ad.data);
            setData(res);
            return res;
          });
        }

        setData(res);
      };
      asyncFn();
    }
  }, [pathname, data]);

  return (
    <div>
      Entry Page
      {data ? (
        <div>
          <h2>Data:</h2>
          <pre>{JSON.stringify(data.data, null, 2)}</pre>
          <h2>Metadata:</h2>
          <pre>{JSON.stringify(data.metadata, null, 2)}</pre>
        </div>
      ) : (
        'Loading...'
      )}
    </div>
  );
};

export default EntryPage;
