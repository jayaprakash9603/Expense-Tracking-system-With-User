/**
 * Fuzzy subsequence matching utilities (VS Code-like).
 *
 * - Matches characters in order (not necessarily contiguous).
 * - Returns original-string indices to support highlighting.
 * - Provides ranking for better match ordering.
 */

export const normalizeFuzzyQuery = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
};

/**
 * Returns an array of indices in `text` that match `query` as a subsequence.
 * If no match, returns null.
 */
export const getFuzzyMatchIndices = (text, query) => {
  const haystack = String(text || "");
  const needle = normalizeFuzzyQuery(query);
  if (!needle) return [];

  const lower = haystack.toLowerCase();
  const indices = [];

  let j = 0;
  for (let i = 0; i < lower.length && j < needle.length; i += 1) {
    if (lower[i] === needle[j]) {
      indices.push(i);
      j += 1;
    }
  }

  return j === needle.length ? indices : null;
};

export const scoreFuzzyMatch = (indices, labelLength) => {
  if (!indices || indices.length === 0) {
    return [0, 0, 0, labelLength ?? 0];
  }

  const start = indices[0] ?? 0;
  const end = indices[indices.length - 1] ?? start;
  const span = end - start;
  const gaps = span - (indices.length - 1);
  return [start, gaps, span, labelLength ?? 0];
};

export const compareFuzzyScores = (aScore, bScore, aIndex = 0, bIndex = 0) => {
  for (let i = 0; i < aScore.length; i += 1) {
    if (aScore[i] < bScore[i]) return -1;
    if (aScore[i] > bScore[i]) return 1;
  }
  return aIndex - bIndex;
};

/**
 * MUI Autocomplete-compatible filterOptions using fuzzy subsequence matching.
 *
 * @param {object} params
 * @param {(option:any)=>string} params.getOptionLabel - Used to display options.
 * @param {(option:any)=>string} [params.getOptionSearchText] - Used to match/rank options (defaults to label).
 */
export const createFuzzyFilterOptions = ({
  getOptionLabel,
  getOptionSearchText,
} = {}) => {
  const labelFn =
    typeof getOptionLabel === "function"
      ? getOptionLabel
      : (opt) => String(opt ?? "");
  const searchFn =
    typeof getOptionSearchText === "function" ? getOptionSearchText : labelFn;

  return (options, state) => {
    const input = String(state?.inputValue || "");
    const query = normalizeFuzzyQuery(input);
    if (!query) return Array.isArray(options) ? options : [];

    const list = Array.isArray(options) ? options : [];

    const ranked = list
      .map((opt, idx) => {
        const searchText = String(searchFn(opt) || "");
        const indices = getFuzzyMatchIndices(searchText, query);
        if (!indices) return null;

        const score = scoreFuzzyMatch(indices, searchText.length);
        return { opt, idx, score };
      })
      .filter(Boolean)
      .sort((a, b) => compareFuzzyScores(a.score, b.score, a.idx, b.idx));

    // Keep original option objects
    return ranked.map((r) => r.opt);
  };
};
