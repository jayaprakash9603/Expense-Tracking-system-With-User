import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { flattenActionTree, SEARCH_MODES } from "../data/actions";
import { GROUP_ORDER, buildFlattenedGroups } from "../utils/ranking";
import {
  getActionFrequencyMap,
  getRecentActionIds,
  incrementActionFrequency,
  pushRecentAction,
} from "../utils/storage";
import {
  MIN_REMOTE_QUERY_LENGTH,
  REMOTE_DEBOUNCE_MS,
  REMOTE_SEARCH_LIMIT,
} from "./commandPaletteConstants";
import {
  buildActionMap,
  dedupeActions,
  getDefaultGroupedResults,
  getRecentActions,
  mapBackendSectionsToActions,
} from "./commandPaletteHelpers";
import { useFuseSearch } from "./useFuseSearch";
import { useKeyboardNavigation } from "./useKeyboardNavigation";

export function useCommandPalette({ currentRoute, onNavigate, baseActions = [], searchRemote, currencySymbol = "$" }) {
  const currentMode = useSelector((state) => state.auth?.currentMode || SEARCH_MODES.USER);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [remoteActions, setRemoteActions] = useState([]);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [recentIds, setRecentIds] = useState(() => getRecentActionIds());
  const [frequencyMap, setFrequencyMap] = useState(() => getActionFrequencyMap());
  const [commandStack, setCommandStack] = useState([{ id: "root", title: "All Commands" }]);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < MIN_REMOTE_QUERY_LENGTH) {
      setRemoteActions([]);
      setRemoteLoading(false);
      setPage(0);
      setHasMore(true);
      return;
    }

    let active = true;
    setRemoteLoading(true);
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await searchRemote?.({
          query: normalizedQuery,
          mode: currentMode,
          limit: REMOTE_SEARCH_LIMIT,
          offset: 0,
        });

        // Map API response directly to sections if it matches the new format
        let sections = response?.sections || [];
        
        // Handle direct entity arrays from API response
        if (!sections.length && response) {
          const newSections = [];
          
          if (response.expenses?.length) {
            newSections.push({ key: "expenses", label: "Expenses", items: response.expenses });
          }
          if (response.budgets?.length) {
            newSections.push({ key: "budgets", label: "Budgets", items: response.budgets });
          }
          if (response.categories?.length) {
            newSections.push({ key: "categories", label: "Categories", items: response.categories });
          }
          if (response.bills?.length) {
            newSections.push({ key: "bills", label: "Bills", items: response.bills });
          }
          if (response.paymentMethods?.length) {
            newSections.push({ key: "paymentMethods", label: "Payment Methods", items: response.paymentMethods });
          }
          if (response.friends?.length) {
            newSections.push({ key: "friends", label: "Friends", items: response.friends });
          }
          if (response.users?.length) {
            newSections.push({ key: "users", label: "Users", items: response.users });
          }
          
          sections = newSections;
        }

        if (!active) return;
        const newActions = mapBackendSectionsToActions(sections, currencySymbol);
        setRemoteActions(newActions);
        setPage(0);
        setHasMore(newActions.length >= REMOTE_SEARCH_LIMIT);
      } catch (error) {
        console.error("Search remote error:", error);
      } finally {
        if (active) setRemoteLoading(false);
      }
    }, REMOTE_DEBOUNCE_MS);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [query, currentMode, searchRemote, currencySymbol]);

  const loadMore = useCallback(async () => {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < MIN_REMOTE_QUERY_LENGTH || remoteLoading || !hasMore) {
      return;
    }

    setRemoteLoading(true);
    try {
      const nextPage = page + 1;
      const response = await searchRemote?.({
        query: normalizedQuery,
        mode: currentMode,
        limit: REMOTE_SEARCH_LIMIT,
        offset: nextPage * REMOTE_SEARCH_LIMIT,
      });

      let sections = response?.sections || [];
      if (!sections.length && response) {
        const newSections = [];
        if (response.expenses?.length) newSections.push({ key: "expenses", label: "Expenses", items: response.expenses });
        if (response.budgets?.length) newSections.push({ key: "budgets", label: "Budgets", items: response.budgets });
        if (response.categories?.length) newSections.push({ key: "categories", label: "Categories", items: response.categories });
        if (response.bills?.length) newSections.push({ key: "bills", label: "Bills", items: response.bills });
        if (response.paymentMethods?.length) newSections.push({ key: "paymentMethods", label: "Payment Methods", items: response.paymentMethods });
        if (response.friends?.length) newSections.push({ key: "friends", label: "Friends", items: response.friends });
        if (response.users?.length) newSections.push({ key: "users", label: "Users", items: response.users });
        sections = newSections;
      }

      const newActions = mapBackendSectionsToActions(sections, currencySymbol);
      if (newActions.length > 0) {
        setRemoteActions(prev => dedupeActions([...prev, ...newActions]));
        setPage(nextPage);
        setHasMore(newActions.length >= REMOTE_SEARCH_LIMIT);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Search remote error:", error);
    } finally {
      setRemoteLoading(false);
    }
  }, [query, currentMode, searchRemote, currencySymbol, remoteLoading, hasMore, page]);

  const rootActions = useMemo(() => {
    if (!query.trim()) return baseActions;
    return dedupeActions([...baseActions, ...remoteActions]);
  }, [baseActions, query, remoteActions]);

  const currentLevel = commandStack[commandStack.length - 1];
  const currentActions = currentLevel.id === "root" ? rootActions : currentLevel.actions || [];

  const flatActionIndex = useMemo(() => flattenActionTree(rootActions), [rootActions]);
  const actionMap = useMemo(() => buildActionMap(flatActionIndex), [flatActionIndex]);

  const { groupedResults: searchedGrouped, loading: fuseLoading } = useFuseSearch({
    actions: currentActions,
    query,
    currentRoute,
    recentIds,
    frequencyMap,
    debounceMs: 300,
  });

  const recentActions = useMemo(
    () => getRecentActions(actionMap, currentActions, recentIds),
    [actionMap, currentActions, recentIds],
  );

  const defaultGrouped = useMemo(
    () => getDefaultGroupedResults(currentActions, recentActions),
    [currentActions, recentActions],
  );

  const groupedResults = query.trim() ? searchedGrouped : defaultGrouped;

  const flatResults = useMemo(() => {
    const source = query.trim() ? searchedGrouped : defaultGrouped;
    return buildFlattenedGroups(source);
  }, [defaultGrouped, query, searchedGrouped]);

  const closePalette = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setRemoteActions([]);
    setRemoteLoading(false);
    setCommandStack([{ id: "root", title: "All Commands" }]);
  }, []);

  const openPalette = useCallback(() => {
    setIsOpen(true);
  }, []);

  const goBackLevel = useCallback(() => {
    setCommandStack((prev) => {
      if (prev.length <= 1) return prev;
      return prev.slice(0, -1);
    });
    setQuery("");
  }, []);

  const executeAction = useCallback(
    (action) => {
      if (!action) return;

      if (Array.isArray(action.children) && action.children.length) {
        setCommandStack((prev) => [
          ...prev,
          {
            id: action.id,
            title: action.name,
            actions: action.children,
          },
        ]);
        setQuery("");
        return;
      }

      if (action.perform) {
        action.perform({ currentRoute, action });
      }

      if (action.route) {
        onNavigate?.(action.route);
      }

      const nextRecent = pushRecentAction(action.id);
      const nextFrequency = incrementActionFrequency(action.id);
      setRecentIds(nextRecent);
      setFrequencyMap(nextFrequency);

      closePalette();
    },
    [closePalette, currentRoute, onNavigate],
  );

  const { selectedIndex, setSelectedIndex } = useKeyboardNavigation({
    isOpen,
    query,
    flatResults,
    canGoBack: commandStack.length > 1,
    onSelect: executeAction,
    onClose: closePalette,
    onGoBack: goBackLevel,
  });

  useEffect(() => {
    const isTypingElement = (element) => {
      if (!element) return false;
      const tag = element.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || element.isContentEditable;
    };

    const handleGlobalKeys = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      if (event.key === "/" && !isOpen && !event.metaKey && !event.ctrlKey && !event.altKey) {
        if (isTypingElement(document.activeElement)) return;
        event.preventDefault();
        setIsOpen(true);
      }
    };

    const openHandler = () => openPalette();
    const closeHandler = () => closePalette();

    window.addEventListener("keydown", handleGlobalKeys);
    window.addEventListener("open-universal-search", openHandler);
    window.addEventListener("close-universal-search", closeHandler);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeys);
      window.removeEventListener("open-universal-search", openHandler);
      window.removeEventListener("close-universal-search", closeHandler);
    };
  }, [closePalette, openPalette, isOpen]);

  const selectedAction = flatResults[selectedIndex] || null;

  const categoryCount = useMemo(
    () =>
      GROUP_ORDER.reduce((acc, key) => {
        acc[key] = (groupedResults[key] || []).length;
        return acc;
      }, {}),
    [groupedResults],
  );

  return {
    isOpen,
    query,
    results: groupedResults,
    selectedIndex,
    selectedAction,
    history: recentIds,
    currentLevel,
    stackDepth: commandStack.length,
    loading: remoteLoading || fuseLoading,
    categoryCount,
    setQuery,
    setSelectedIndex,
    openPalette,
    closePalette,
    goBackLevel,
    executeAction,
    flatResults,
    loadMore,
    hasMore,
  };
}

export default useCommandPalette;
