const PREFIX = "expensio_";

function prefixKey(key) {
  return `${PREFIX}${key}`;
}

export const storageAdapter = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(prefixKey(key));
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(prefixKey(key), JSON.stringify(value));
    } catch {
      /* storage full or not available */
    }
  },

  remove(key) {
    localStorage.removeItem(prefixKey(key));
  },

  has(key) {
    return localStorage.getItem(prefixKey(key)) !== null;
  },

  clear() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(PREFIX)) keysToRemove.push(k);
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  },

  getAll() {
    const result = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(PREFIX)) {
        try {
          result[k.replace(PREFIX, "")] = JSON.parse(localStorage.getItem(k));
        } catch {
          result[k.replace(PREFIX, "")] = localStorage.getItem(k);
        }
      }
    }
    return result;
  },
};

export default storageAdapter;
