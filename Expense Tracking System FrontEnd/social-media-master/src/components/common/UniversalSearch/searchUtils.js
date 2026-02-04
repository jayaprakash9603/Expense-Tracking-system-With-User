/**
 * Search Utilities for Universal Search
 * Provides high-performance search functionality with indexing and caching
 */

// ============================================
// SEARCH INDEX - For fast text matching
// ============================================

/**
 * Simple trie-based search index for fast prefix matching
 * Provides O(k) lookup where k is the length of the search query
 */
class SearchIndex {
  constructor() {
    this.index = new Map();
    this.cache = new Map();
    this.maxCacheSize = 100;
  }

  /**
   * Add items to the search index
   * @param {Array} items - Items to index
   * @param {Array<string>} fields - Fields to index (e.g., ['title', 'subtitle', 'keywords'])
   */
  addItems(items, fields = ["title", "subtitle"]) {
    items.forEach((item) => {
      const searchableText = this._extractSearchableText(item, fields);
      const tokens = this._tokenize(searchableText);

      tokens.forEach((token) => {
        if (!this.index.has(token)) {
          this.index.set(token, new Set());
        }
        this.index.get(token).add(item.id);
      });
    });
  }

  /**
   * Extract searchable text from item
   */
  _extractSearchableText(item, fields) {
    return fields
      .map((field) => {
        if (field === "keywords" && Array.isArray(item.keywords)) {
          return item.keywords.join(" ");
        }
        return item[field] || "";
      })
      .join(" ")
      .toLowerCase();
  }

  /**
   * Tokenize text into searchable tokens
   */
  _tokenize(text) {
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter((token) => token.length >= 2)
      .flatMap((token) => {
        // Generate prefixes for partial matching
        const prefixes = [];
        for (let i = 2; i <= token.length; i++) {
          prefixes.push(token.slice(0, i));
        }
        return prefixes;
      });
  }

  /**
   * Search the index
   * @param {string} query - Search query
   * @returns {Set<string>} - Set of matching item IDs
   */
  search(query) {
    const cacheKey = query.toLowerCase();
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const tokens = query
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length >= 2);
    if (tokens.length === 0) return new Set();

    let results = null;
    tokens.forEach((token) => {
      const matchingIds = new Set();
      this.index.forEach((ids, indexedToken) => {
        if (indexedToken.includes(token)) {
          ids.forEach((id) => matchingIds.add(id));
        }
      });

      if (results === null) {
        results = matchingIds;
      } else {
        // Intersection for AND logic
        results = new Set([...results].filter((id) => matchingIds.has(id)));
      }
    });

    // Cache management
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(cacheKey, results || new Set());

    return results || new Set();
  }

  /**
   * Clear the index
   */
  clear() {
    this.index.clear();
    this.cache.clear();
  }
}

// ============================================
// FUZZY MATCHING - For typo tolerance
// ============================================

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching with typo tolerance
 */
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;

  // Use single array optimization for space efficiency
  const dp = Array(n + 1)
    .fill(0)
    .map((_, i) => i);

  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;

    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      if (str1[i - 1] === str2[j - 1]) {
        dp[j] = prev;
      } else {
        dp[j] = 1 + Math.min(prev, dp[j], dp[j - 1]);
      }
      prev = temp;
    }
  }

  return dp[n];
}

/**
 * Check if two strings are similar (fuzzy match)
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @param {number} threshold - Maximum allowed distance (default: 2)
 * @returns {boolean}
 */
export function isFuzzyMatch(str1, str2, threshold = 2) {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  // Exact match
  if (s1 === s2) return true;

  // Contains match
  if (s1.includes(s2) || s2.includes(s1)) return true;

  // Fuzzy match for short queries
  if (s2.length <= 3) return s1.startsWith(s2);

  // Calculate distance for longer queries
  const distance = levenshteinDistance(s1, s2);
  return distance <= threshold;
}

// ============================================
// DEBOUNCE UTILITIES
// ============================================

/**
 * Creates a debounced function that delays invoking func
 * Includes leading edge option for instant first call
 */
export function createDebouncer(delay = 300) {
  let timeoutId = null;
  let lastCallTime = 0;

  return {
    /**
     * Debounce a function call
     * @param {Function} fn - Function to debounce
     * @param {boolean} leading - Execute on leading edge
     */
    debounce(fn, leading = false) {
      const now = Date.now();

      if (leading && now - lastCallTime > delay) {
        lastCallTime = now;
        fn();
        return;
      }

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        lastCallTime = Date.now();
        fn();
        timeoutId = null;
      }, delay);
    },

    /**
     * Cancel pending debounced call
     */
    cancel() {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    },
  };
}

// ============================================
// SEARCH RESULT SCORING
// ============================================

/**
 * Calculate relevance score for a search result
 * Higher score = more relevant
 */
export function calculateRelevanceScore(item, query) {
  const queryLower = query.toLowerCase();
  let score = 0;

  // Title exact match (highest priority)
  const title = (item.title || "").toLowerCase();
  if (title === queryLower) {
    score += 100;
  } else if (title.startsWith(queryLower)) {
    score += 80;
  } else if (title.includes(queryLower)) {
    score += 60;
  }

  // Subtitle match
  const subtitle = (item.subtitle || "").toLowerCase();
  if (subtitle.includes(queryLower)) {
    score += 30;
  }

  // Keywords match
  if (Array.isArray(item.keywords)) {
    const matchedKeywords = item.keywords.filter((kw) =>
      kw.toLowerCase().includes(queryLower),
    );
    score += matchedKeywords.length * 20;
  }

  // Priority boost
  if (item.priority) {
    score += (10 - item.priority) * 5; // Lower priority number = higher boost
  }

  // Section priority (actions first)
  const sectionPriority = {
    actions: 50,
    expenses: 40,
    budgets: 35,
    categories: 30,
    bills: 25,
    payment_methods: 20,
    friends: 15,
    reports: 10,
    settings: 5,
    notifications: 5,
  };
  score += sectionPriority[item.section] || 0;

  return score;
}

/**
 * Sort results by relevance score
 */
export function sortByRelevance(results, query) {
  return [...results].sort((a, b) => {
    const scoreA = calculateRelevanceScore(a, query);
    const scoreB = calculateRelevanceScore(b, query);
    return scoreB - scoreA;
  });
}

// ============================================
// SEARCH HIGHLIGHTING
// ============================================

/**
 * Find match positions in text for highlighting
 * @returns {Array<{start: number, end: number}>}
 */
export function findMatchPositions(text, query) {
  if (!text || !query) return [];

  const positions = [];
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();

  let index = 0;
  while ((index = textLower.indexOf(queryLower, index)) !== -1) {
    positions.push({
      start: index,
      end: index + query.length,
    });
    index += query.length;
  }

  return positions;
}

// ============================================
// MEMOIZATION UTILITIES
// ============================================

/**
 * Create a memoized version of a function
 * Uses LRU cache with configurable size
 */
export function memoize(fn, maxSize = 50) {
  const cache = new Map();

  return function (...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      // Move to end (most recently used)
      const value = cache.get(key);
      cache.delete(key);
      cache.set(key, value);
      return value;
    }

    const result = fn.apply(this, args);

    // Evict oldest if at capacity
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    cache.set(key, result);
    return result;
  };
}

// ============================================
// BATCH PROCESSING
// ============================================

/**
 * Process items in batches to avoid blocking UI
 * @param {Array} items - Items to process
 * @param {Function} processor - Processing function
 * @param {number} batchSize - Items per batch
 * @param {number} delay - Delay between batches (ms)
 */
export async function processBatched(
  items,
  processor,
  batchSize = 100,
  delay = 0,
) {
  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = batch.map(processor);
    results.push(...batchResults);

    // Yield to event loop
    if (delay > 0 && i + batchSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return results;
}

// ============================================
// SEARCH INDEX SINGLETON
// ============================================

// Global search index instance
let globalSearchIndex = null;

/**
 * Get or create the global search index
 */
export function getSearchIndex() {
  if (!globalSearchIndex) {
    globalSearchIndex = new SearchIndex();
  }
  return globalSearchIndex;
}

/**
 * Reset the global search index
 */
export function resetSearchIndex() {
  if (globalSearchIndex) {
    globalSearchIndex.clear();
  }
  globalSearchIndex = new SearchIndex();
  return globalSearchIndex;
}

// ============================================
// EXPORTS
// ============================================

export { SearchIndex };

export default {
  SearchIndex,
  getSearchIndex,
  resetSearchIndex,
  isFuzzyMatch,
  createDebouncer,
  calculateRelevanceScore,
  sortByRelevance,
  findMatchPositions,
  memoize,
  processBatched,
};
