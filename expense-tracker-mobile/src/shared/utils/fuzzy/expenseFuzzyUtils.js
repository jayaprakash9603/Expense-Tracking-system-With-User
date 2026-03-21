export function normalizeFuzzyQuery(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

export function getFuzzyMatchIndices(text, query) {
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
}

export function scoreFuzzyMatch(indices, labelLength) {
  if (!indices || indices.length === 0) {
    return [0, 0, 0, labelLength ?? 0];
  }

  const start = indices[0] ?? 0;
  const end = indices[indices.length - 1] ?? start;
  const span = end - start;
  const gaps = span - (indices.length - 1);
  return [start, gaps, span, labelLength ?? 0];
}

export function compareFuzzyScores(aScore, bScore, aIndex = 0, bIndex = 0) {
  for (let i = 0; i < aScore.length; i += 1) {
    if (aScore[i] < bScore[i]) return -1;
    if (aScore[i] > bScore[i]) return 1;
  }
  return aIndex - bIndex;
}

export function createFuzzyFilterOptions({
  getOptionLabel,
  getOptionSearchText,
} = {}) {
  const labelFn =
    typeof getOptionLabel === "function"
      ? getOptionLabel
      : (option) => String(option ?? "");
  const searchFn =
    typeof getOptionSearchText === "function" ? getOptionSearchText : labelFn;

  return (options, state) => {
    const input = String(state?.inputValue || "");
    const query = normalizeFuzzyQuery(input);
    if (!query) return Array.isArray(options) ? options : [];

    const list = Array.isArray(options) ? options : [];

    const ranked = list
      .map((option, index) => {
        const searchText = String(searchFn(option) || "");
        const indices = getFuzzyMatchIndices(searchText, query);
        if (!indices) return null;
        const score = scoreFuzzyMatch(indices, searchText.length);
        return { option, index, score };
      })
      .filter(Boolean)
      .sort((a, b) => compareFuzzyScores(a.score, b.score, a.index, b.index));

    return ranked.map((entry) => entry.option);
  };
}
