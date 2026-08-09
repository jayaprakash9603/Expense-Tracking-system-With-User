const JWT_KEY = "jwt";

/**
 * @typedef {Object} TokenPort
 * @property {() => string|null} getToken
 * @property {(token: string) => void} setToken
 * @property {() => void} clearToken
 * @property {() => boolean} hasToken
 */

/**
 * Create a token port backed by a storage port.
 * Single owner of the "jwt" key — all adapters must use this.
 *
 * @param {import('../storage/storagePort').StoragePort} storage
 * @returns {TokenPort}
 */
export const createTokenPort = (storage) => {
  const getToken = () => storage.getItem(JWT_KEY);
  const setToken = (token) => {
    if (token) {
      storage.setItem(JWT_KEY, token);
    } else {
      storage.removeItem(JWT_KEY);
    }
  };
  const clearToken = () => storage.removeItem(JWT_KEY);
  const hasToken = () => Boolean(getToken());

  return Object.freeze({
    getToken,
    setToken,
    clearToken,
    hasToken,
    key: JWT_KEY,
  });
};
