import { useEffect, useState } from 'react';

// import { logger } from '@/libs/Logger';

interface Entry {
  id: number;
  // Add other properties as needed
  data: string;
  metadata: string;
  createdAt: string;
  updatedAt: string;
}

const useEntries = () => {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch('http://localhost:8088/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: 'hunters are a special breed of elite members of society',
            dbPath:
              '/Users/bram/Dropbox/PARA/Projects/api-gateway-local-build/api-gateway-electron/yourcommonbase.db',
          }),
        });
        const data: Entry[] = await response.json();
        console.info('Fetched entries:', data);
        const updatedEntries = data.map((entry) => {
          try {
            return { ...entry, metadata: JSON.parse(entry.metadata) };
          } catch (err) {
            console.error('Error parsing metadata:', err);
            return entry;
          }
        });
        setEntries(updatedEntries);
      } catch (error) {
        setEntries([
          {
            id: -1,
            data: 'Error fetching entries',
            metadata: '',
            createdAt: '',
            updatedAt: '',
          },
        ]);
      }
    };

    fetchEntries();
  }, []);

  return { entries };
};

export default useEntries;
