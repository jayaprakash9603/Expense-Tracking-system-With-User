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
    { name: "subtitle", weight: 0.4 },
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
      
      // Also include any actions that are remote or exact substring matches but might have been missed by fuse
      const searchedIds = new Set(searched.map(r => r.item.id));
      const lowerQuery = query.toLowerCase();
      
      const extraMatches = actions.filter(action => {
        if (searchedIds.has(action.id)) return false;
        
        // Always include remote actions as they are already filtered by backend
        if (action.isRemote) return true;
        
        // Include exact substring matches
        const nameMatch = action.name?.toLowerCase().includes(lowerQuery);
        const subtitleMatch = action.subtitle?.toLowerCase().includes(lowerQuery);
        const keywordMatch = action.keywords?.some(k => k?.toLowerCase().includes(lowerQuery));
        return nameMatch || subtitleMatch || keywordMatch;
      }).map(item => ({ item, score: 0.1 })); // Give them a good base score

      const allMatches = [...searched, ...extraMatches];

      const ranked = allMatches
        .map((result) => {
          const score = calculateSmartScore({
            action: result.item,
            fuseScore: result.score,
            recentIds,
            frequencyMap,
            currentRoute,
            query,
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
  }, [query, fuse, currentRoute, recentIds, frequencyMap, debounceMs, actions]);

  return {
    groupedResults,
    flatResults,
    loading,
  };
}

export default useFuseSearch;
