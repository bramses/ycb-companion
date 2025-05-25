'use client';

import { useEffect } from 'react';

const queueKey = 'addQueue';
const callbacks = new Map<string, (resp: any) => void>();

export type AddQueueItem = {
  type: 'text' | 'url';
  data?: any;
  url?: string;
  metadata: any; // contains local_id
  parentId?: string;
  retries: number;
};

let interval: NodeJS.Timeout | null = null;

function getQueue(): AddQueueItem[] {
  const raw = sessionStorage.getItem(queueKey);
  return raw ? JSON.parse(raw) : [];
}

function saveQueue(queue: AddQueueItem[]) {
  sessionStorage.setItem(queueKey, JSON.stringify(queue));
}

export function enqueueAddText(
  item: Omit<AddQueueItem, 'type' | 'retries'>,
  onSuccess?: (resp: any) => void,
) {
  // eslint-disable-next-line
  const local_id = `local-${crypto.randomUUID()}`;
  const queue = getQueue();
  queue.push({
    ...item,
    type: 'text',
    retries: 0,
    metadata: { ...item.metadata, local_id },
  });
  saveQueue(queue);
  if (onSuccess) callbacks.set(local_id, onSuccess);
}

export function enqueueAddURL(
  item: Omit<AddQueueItem, 'type' | 'retries'>,
  onSuccess?: (resp: any) => void,
) {
  // eslint-disable-next-line
  const local_id = `local-${crypto.randomUUID()}`;
  const queue = getQueue();
  queue.push({
    ...item,
    type: 'url',
    retries: 0,
    metadata: { ...item.metadata, local_id },
  });
  saveQueue(queue);
  if (onSuccess) callbacks.set(local_id, onSuccess);
}

export function useAddQueueProcessor() {
  useEffect(() => {
    const runQueue = () => {
      if (interval) return;
      interval = setInterval(async () => {
        if (!navigator.onLine) return;
        const queue = getQueue();
        if (!queue.length) return;

        const [next, ...rest] = queue;

        if (!next) return;

        // eslint-disable-next-line
        const { local_id, ...cleanMeta } = next.metadata || {};
        const payload = { ...next, metadata: cleanMeta };

        let endpoint = '/api/add';
        if (next.type === 'url') endpoint = '/api/addURL';

        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const json = await res.json();

          if (res.ok) {
            // fire callback if any
            const cb = callbacks.get(local_id);
            if (cb) {
              cb(json.respData ?? json.data ?? json);
              callbacks.delete(local_id);
            }
            saveQueue(rest);
          } else {
            next.retries += 1; // increment retries
            if (next.retries >= 5) {
              console.warn('dropping after 5 retries', next);
              saveQueue(rest);
            } else {
              saveQueue([...rest, next]);
            }
          }
        } catch (err) {
          console.error('queue error', err);
        }
      }, 5_000);
    };

    const stopQueue = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    window.addEventListener('online', runQueue);
    window.addEventListener('offline', stopQueue);
    if (navigator.onLine) runQueue();

    return () => {
      window.removeEventListener('online', runQueue);
      window.removeEventListener('offline', stopQueue);
      stopQueue();
    };
  }, []);
}

export function getPendingQueue(): AddQueueItem[] {
  return getQueue();
}
