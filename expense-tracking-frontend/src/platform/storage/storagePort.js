/**
 * @typedef {Object} StoragePort
 * @property {(key: string) => string|null} getItem
 * @property {(key: string, value: string) => void} setItem
 * @property {(key: string) => void} removeItem
 */

/**
 * localStorage-backed storage adapter.
 * @returns {StoragePort}
 */
export const createLocalStorageAdapter = () => {
  const safe = () => typeof window !== "undefined" && window.localStorage;

  return Object.freeze({
    getItem: (key) => {
      if (!safe()) return null;
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: (key, value) => {
      if (!safe()) return;
      try {
        window.localStorage.setItem(key, value);
      } catch {
        /* ignore quota / private mode */
      }
    },
    removeItem: (key) => {
      if (!safe()) return;
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    },
  });
};

/**
 * In-memory storage for tests / mock transport.
 * @returns {StoragePort}
 */
export const createMemoryStorageAdapter = () => {
  const map = new Map();
  return Object.freeze({
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => {
      map.set(key, String(value));
    },
    removeItem: (key) => {
      map.delete(key);
    },
  });
};
