export function fuzzyMatch(text, query) {
  if (!query) return { match: true, score: 0 };
  if (!text) return { match: false, score: 0 };

  const normalizedText = String(text).toLowerCase();
  const normalizedQuery = String(query).toLowerCase();

  if (normalizedText === normalizedQuery) return { match: true, score: 1 };
  if (normalizedText.includes(normalizedQuery)) return { match: true, score: 0.8 };
  if (normalizedText.startsWith(normalizedQuery)) return { match: true, score: 0.9 };

  let queryIdx = 0;
  let score = 0;
  let consecutiveMatches = 0;

  for (let i = 0; i < normalizedText.length && queryIdx < normalizedQuery.length; i++) {
    if (normalizedText[i] === normalizedQuery[queryIdx]) {
      queryIdx++;
      consecutiveMatches++;
      score += consecutiveMatches;
    } else {
      consecutiveMatches = 0;
    }
  }

  const matched = queryIdx === normalizedQuery.length;
  const normalizedScore = matched ? score / (normalizedQuery.length * normalizedText.length) : 0;

  return { match: matched, score: normalizedScore };
}

export function fuzzySearch(items, query, fields, minScore = 0) {
  if (!query) return items;

  return items
    .map((item) => {
      let bestScore = 0;
      for (const field of fields) {
        const value = item[field];
        if (value) {
          const { match, score } = fuzzyMatch(value, query);
          if (match && score > bestScore) bestScore = score;
        }
      }
      return { item, score: bestScore };
    })
    .filter(({ score }) => score > minScore)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}
