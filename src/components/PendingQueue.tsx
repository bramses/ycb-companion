'use client';

import { useEffect, useState } from 'react';

import { getPendingQueue } from '@/hooks/useAddQueue'; // TODO remove this

interface Props {
  idSet: React.MutableRefObject<Set<string>>;
}

export default function PendingQueue({ idSet }: Props) {
  const [pendingItems, setPendingItems] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const raw = getPendingQueue();
      const filtered = raw.filter((item: any) => {
        const localId = item.metadata?.local_id;
        return localId && !idSet.current.has(localId);
      });
      setPendingItems(filtered);
    }, 1000);

    return () => clearInterval(interval);
  }, [idSet]);

  function cancelPending(itemToCancel: any) {
    const raw = getPendingQueue();
    const cleaned = raw.filter(
      (i) => i.metadata?.local_id !== itemToCancel.metadata?.local_id,
    );
    sessionStorage.setItem('addQueue', JSON.stringify(cleaned));
  }

  if (pendingItems.length === 0) return null;

  return (
    <div className="mt-2 text-sm text-yellow-600">
      <strong>Queued:</strong>
      <ul className="ml-4 list-disc space-y-1">
        {pendingItems.map((item, idx) => {
          const retryIn = Math.max(0, 5 - (item.retries || 0));
          const label = item.type === 'url' ? `[url]` : `[text]`;
          return (
            // eslint-disable-next-line react/no-array-index-key
            <li key={`pending-item-${idx}`} className="flex items-center gap-2">
              <span>
                {label} {item.data}
              </span>
              <span className="animate-spin text-yellow-500">⏳</span>
              <span className="text-xs text-gray-500">
                retry in ~{retryIn}s
              </span>
              <button
                onClick={() => cancelPending(item)}
                type="button"
                className="ml-2 text-xs text-red-500 underline"
              >
                cancel
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
