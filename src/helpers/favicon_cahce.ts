const CACHE_KEY = 'faviconCache';
const CACHE_EXPIRATION = 10 * 60 * 1000 * 60; // 10 hours in milliseconds

export const getFaviconCache = () => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return { favicon: {} }; // Check for client-side and localStorage
  }
  const cache = localStorage.getItem(CACHE_KEY);
  if (cache) {
    const parsedCache = JSON.parse(cache);
    if (Date.now() - parsedCache.timestamp < CACHE_EXPIRATION) {
      return parsedCache.data;
    }
  }
  return { favicon: {} };
};

export const setFaviconCache = (data: any) => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined')
    return; // Check for client-side and localStorage
  const cache = {
    timestamp: Date.now(),
    data,
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
};

export const appendFaviconToCache = (query: string, url: any) => {
  const cache = getFaviconCache();

  cache.favicon[query] = url;

  setFaviconCache(cache);
};

export const invalidateFaviconFromCache = (query: string) => {
  const cache = getFaviconCache();

  delete cache.favicon[query];

  setFaviconCache(cache);
};

export const clearFaviconCache = () => {
  localStorage.removeItem(CACHE_KEY);
};
