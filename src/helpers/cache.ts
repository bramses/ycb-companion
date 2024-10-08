const CACHE_KEY = 'entryAndSearchResultCache';
const CACHE_EXPIRATION = 10 * 60 * 1000;

export const getCache = () => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return { searches: {}, entries: {} }; // Check for client-side and localStorage
  }
  const cache = localStorage.getItem(CACHE_KEY);
  if (cache) {
    const parsedCache = JSON.parse(cache);
    if (Date.now() - parsedCache.timestamp < CACHE_EXPIRATION) {
      return parsedCache.data;
    }
  }
  return { searches: {}, entries: {} };
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

export const appendSearchToCache = (query: string, results: any) => {
  const cache = getCache();

  cache.searches[query] = results;

  setCache(cache);
};

export const invalidateSearchFromCache = (query: string) => {
  const cache = getCache();

  delete cache.searches[query];

  setCache(cache);
};

export const clearCache = () => {
  localStorage.removeItem(CACHE_KEY);
};
