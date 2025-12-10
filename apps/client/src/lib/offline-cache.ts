/**
 * Offline cache utilities for storing and retrieving data when offline
 */

const CACHE_PREFIX = "torneo-cache-";
const CACHE_VERSION = "v1";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Store data in localStorage with expiration
 */
export function setCache<T>(key: string, data: T, ttlSeconds: number = 60 * 60 * 24): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttlSeconds * 1000,
    };
    localStorage.setItem(`${CACHE_PREFIX}${CACHE_VERSION}-${key}`, JSON.stringify(entry));
  } catch (error) {
    console.error("Error setting cache:", error);
  }
}

/**
 * Retrieve data from localStorage cache
 */
export function getCache<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${CACHE_VERSION}-${key}`);
    if (!cached) {
      return null;
    }

    const entry: CacheEntry<T> = JSON.parse(cached);

    // Check if cache has expired
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(`${CACHE_PREFIX}${CACHE_VERSION}-${key}`);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error("Error getting cache:", error);
    return null;
  }
}

/**
 * Clear a specific cache entry
 */
export function clearCache(key: string): void {
  try {
    localStorage.removeItem(`${CACHE_PREFIX}${CACHE_VERSION}-${key}`);
  } catch (error) {
    console.error("Error clearing cache:", error);
  }
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("Error clearing all cache:", error);
  }
}

/**
 * Cache keys
 */
export const CACHE_KEYS = {
  STANDINGS: "standings",
  MATCHES: "matches",
  TOP_SCORERS: "top-scorers",
} as const;
