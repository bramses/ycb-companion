const CACHE_KEY = 'entryCache';
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const getCache = () => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return { aliases: {}, parents: {} }; // Check for client-side and localStorage
  }
  const cache = localStorage.getItem(CACHE_KEY);
  if (cache) {
    const parsedCache = JSON.parse(cache);
    if (Date.now() - parsedCache.timestamp < CACHE_EXPIRATION) {
      return parsedCache.data;
    }
  }
  return { aliases: {}, parents: {} };
};

export const setCache = (data: any) => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined')
    return; // Check for client-side and localStorage
  const cache = {
    timestamp: Date.now(),
    data,
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
};

export const appendCache = (id: string, entry: any, isAlias: boolean) => {
  const cache = getCache();
  if (isAlias) {
    cache.aliases[id] = entry;
  } else {
    cache.parents[id] = entry;
  }
  setCache(cache);
};

export const invalidateCache = (id: string, isAlias: boolean) => {
  console.log('Invalidating cache for:', id);
  const cache = getCache();
  if (isAlias) {
    delete cache.aliases[id];
  } else {
    delete cache.parents[id];
  }
  console.log('Cache after invalidation:', cache);
  setCache(cache);
};
