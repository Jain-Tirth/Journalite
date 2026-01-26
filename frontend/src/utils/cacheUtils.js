/**
 * Simple in-memory cache implementation
 */
class Cache {
  constructor(maxAge = 60000) { // Default cache expiration: 1 minute
    this.cache = {};
    this.maxAge = maxAge;
  }

  /**
   * Get an item from the cache
   * @param {string} key - Cache key
   * @returns {any|null} - Cached value or null if not found or expired
   */
  get(key) {
    const item = this.cache[key];
    if (!item) return null;

    // Check if the item has expired
    if (Date.now() > item.expiry) {
      delete this.cache[key];
      return null;
    }

    return item.value;
  }

  /**
   * Set an item in the cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} [customMaxAge] - Custom expiration time in milliseconds
   */
  set(key, value, customMaxAge) {
    const expiry = Date.now() + (customMaxAge || this.maxAge);
    this.cache[key] = { value, expiry };
  }

  /**
   * Remove an item from the cache
   * @param {string} key - Cache key
   */
  remove(key) {
    delete this.cache[key];
  }

  /**
   * Clear all items from the cache
   */
  clear() {
    this.cache = {};
  }

  /**
   * Clear all items that match a prefix
   * @param {string} prefix - Key prefix to match
   */
  clearByPrefix(prefix) {
    Object.keys(this.cache).forEach(key => {
      if (key.startsWith(prefix)) {
        delete this.cache[key];
      }
    });
  }
}

// Create cache instances with different expiration times
export const shortCache = new Cache(30000); // 30 seconds
export const mediumCache = new Cache(5 * 60000); // 5 minutes
export const longCache = new Cache(30 * 60000); // 30 minutes

/**
 * Wrapper function to cache the result of an async function
 * @param {Function} fn - Async function to execute
 * @param {string} cacheKey - Cache key
 * @param {Cache} cache - Cache instance to use
 * @param {boolean} [forceRefresh=false] - Force refresh the cache
 * @returns {Promise<any>} - Result of the function
 */
export const withCache = async (fn, cacheKey, cache, forceRefresh = false) => {
  // If force refresh is requested, skip the cache lookup
  if (!forceRefresh) {
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
  }

  // Execute the function and cache the result
  const result = await fn();
  cache.set(cacheKey, result);
  return result;
};

/**
 * Clear cache when data is modified
 * @param {string} prefix - Cache key prefix to clear
 */
export const invalidateCache = (prefix) => {
  shortCache.clearByPrefix(prefix);
  mediumCache.clearByPrefix(prefix);
  longCache.clearByPrefix(prefix);
};
