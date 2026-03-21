import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import {
  buildFlattenedGroups,
  calculateSmartScore,
  groupAndLimit,
  MAX_RESULTS_PER_CATEGORY,
} from "../utils/ranking";

const FUSE_OPTIONS = {
  includeScore: true,
  shouldSort: false,
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 2,
  keys: [
    { name: "name", weight: 0.5 },
    { name: "keywords", weight: 0.35 },
    { name: "section", weight: 0.1 },
    { name: "category", weight: 0.05 },
  ],
};

export function useFuseSearch({
  actions,
  query,
  currentRoute,
  recentIds,
  frequencyMap,
  debounceMs = 200,
}) {
  const [groupedResults, setGroupedResults] = useState({});
  const [flatResults, setFlatResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const fuse = useMemo(() => new Fuse(actions, FUSE_OPTIONS), [actions]);

  useEffect(() => {
    if (!query.trim()) {
      setGroupedResults({});
      setFlatResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeoutId = window.setTimeout(() => {
      const searched = fuse.search(query);

      const ranked = searched
        .map((result) => {
          const score = calculateSmartScore({
            action: result.item,
            fuseScore: result.score,
            recentIds,
            frequencyMap,
            currentRoute,
          });
          return {
            ...result.item,
            _score: score,
          };
        })
        .sort((a, b) => b._score - a._score);

      const grouped = groupAndLimit(ranked, MAX_RESULTS_PER_CATEGORY);
      setGroupedResults(grouped);
      setFlatResults(buildFlattenedGroups(grouped));
      setLoading(false);
    }, debounceMs);

    return () => window.clearTimeout(timeoutId);
  }, [query, fuse, currentRoute, recentIds, frequencyMap, debounceMs]);

  return {
    groupedResults,
    flatResults,
    loading,
  };
}

export default useFuseSearch;
