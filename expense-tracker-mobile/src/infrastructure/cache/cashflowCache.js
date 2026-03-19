const CACHE_PREFIX = "expensio_cache_";
const DEFAULT_TTL = 5 * 60 * 1000;

function getCacheKey(key) {
  return `${CACHE_PREFIX}${key}`;
}

export const cashflowCache = {
  get(key) {
    try {
      const raw = localStorage.getItem(getCacheKey(key));
      if (!raw) return null;
      const { data, expiry } = JSON.parse(raw);
      if (expiry && Date.now() > expiry) {
        this.remove(key);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  },

  set(key, data, ttl = DEFAULT_TTL) {
    try {
      const entry = { data, expiry: Date.now() + ttl };
      localStorage.setItem(getCacheKey(key), JSON.stringify(entry));
    } catch {
      /* storage full */
    }
  },

  remove(key) {
    localStorage.removeItem(getCacheKey(key));
  },

  invalidate(pattern) {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(CACHE_PREFIX) && (!pattern || k.includes(pattern))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  },

  clearAll() {
    this.invalidate();
  },
};

export default cashflowCache;
