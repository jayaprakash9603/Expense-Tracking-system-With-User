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
  filterLocalEntityActions,
  getDefaultGroupedResults,
  getRecentActions,
  mapBackendSectionsToActions,
} from "./commandPaletteHelpers";
import { useFuseSearch } from "./useFuseSearch";
import { useKeyboardNavigation } from "./useKeyboardNavigation";

export function useCommandPalette({ currentRoute, onNavigate, baseActions = [], searchRemote }) {
  const currentMode = useSelector((state) => state.auth?.currentMode || SEARCH_MODES.USER);
  const expenses = useSelector((state) => state.expenses?.list || []);
  const budgets = useSelector((state) => state.budgets?.list || []);
  const categories = useSelector((state) => state.categories?.list || []);
  const bills = useSelector((state) => state.bills?.list || []);
  const paymentMethods = useSelector((state) => state.paymentMethods?.list || []);
  const friends = useSelector((state) => state.friends?.list || []);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [remoteActions, setRemoteActions] = useState([]);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [recentIds, setRecentIds] = useState(() => getRecentActionIds());
  const [frequencyMap, setFrequencyMap] = useState(() => getActionFrequencyMap());
  const [commandStack, setCommandStack] = useState([{ id: "root", title: "All Commands" }]);

  const localEntityActions = useMemo(
    () =>
      filterLocalEntityActions({
        query,
        expenses,
        budgets,
        categories,
        bills,
        paymentMethods,
        friends,
      }),
    [query, expenses, budgets, categories, bills, paymentMethods, friends],
  );

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < MIN_REMOTE_QUERY_LENGTH) {
      setRemoteActions([]);
      setRemoteLoading(false);
      return;
    }

    let active = true;
    setRemoteLoading(true);
    const timeoutId = window.setTimeout(async () => {
      const response = await searchRemote?.({
        query: normalizedQuery,
        mode: currentMode,
        limit: REMOTE_SEARCH_LIMIT,
      });

      const sections = response?.sections || [];

      if (!active) return;
      setRemoteActions(mapBackendSectionsToActions(sections));
      setRemoteLoading(false);
    }, REMOTE_DEBOUNCE_MS);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [query, currentMode, searchRemote]);

  const rootActions = useMemo(() => {
    if (!query.trim()) return baseActions;
    return dedupeActions([...baseActions, ...localEntityActions, ...remoteActions]);
  }, [baseActions, localEntityActions, query, remoteActions]);

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
    debounceMs: 200,
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
  };
}

export default useCommandPalette;
