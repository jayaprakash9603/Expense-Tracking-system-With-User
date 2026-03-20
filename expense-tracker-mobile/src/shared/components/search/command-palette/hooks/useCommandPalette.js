import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { flattenActionTree, SEARCH_MODES } from "../data/actions";
import {
  GROUP_ORDER,
  MAX_RESULTS_PER_CATEGORY,
  flattenGrouped,
  groupAndLimit,
} from "../utils/ranking";
import {
  getActionFrequencyMap,
  getRecentActionIds,
  incrementActionFrequency,
  pushRecentAction,
} from "../utils/storage";
import { useFuseSearch } from "./useFuseSearch";
import { useKeyboardNavigation } from "./useKeyboardNavigation";

const MIN_REMOTE_QUERY_LENGTH = 2;

function normalizeCollection(value) {
  if (Array.isArray(value)) return value;
  return [];
}

function buildSearchText(...values) {
  return values
    .filter(Boolean)
    .map((value) => String(value))
    .join(" ")
    .toLowerCase();
}

function mapBackendItemTypeToIcon(type, sectionKey) {
  if (type === "EXPENSE") return "💸";
  if (type === "BUDGET") return "📊";
  if (type === "CATEGORY") return "🏷️";
  if (type === "BILL") return "🧾";
  if (type === "PAYMENT_METHOD") return "💳";
  if (type === "FRIEND") return "🤝";
  if (type === "USER") return "👤";
  if (type === "HELP") return "❓";
  if (sectionKey === "help") return "❓";
  return "➡️";
}

function mapBackendSectionsToActions(sections) {
  if (!Array.isArray(sections)) return [];

  return sections.flatMap((section) => {
    const sectionKey = section?.key || "search";
    const sectionLabel = section?.label || "Search";
    return normalizeCollection(section?.items).map((item) => {
      const type = item?.type || "ACTION";
      const name = item?.label || "Result";
      const description = item?.description || "";
      const category = sectionKey === "help" ? "Settings" : "Actions";
      return {
        id: `api-${sectionKey}-${item?.id || name}`,
        name,
        keywords: [name, description, type, sectionLabel],
        category,
        section: sectionLabel,
        icon: item?.icon || mapBackendItemTypeToIcon(type, sectionKey),
        route: item?.route || "",
        priority: 2,
      };
    });
  });
}

function filterLocalEntityActions({
  query,
  expenses,
  budgets,
  categories,
  bills,
  paymentMethods,
  friends,
}) {
  const searchValue = String(query || "")
    .trim()
    .toLowerCase();
  if (searchValue.length < MIN_REMOTE_QUERY_LENGTH) return [];

  const matchedExpenses = normalizeCollection(expenses)
    .filter((item) =>
      buildSearchText(item?.name, item?.description, item?.comments, item?.categoryName).includes(
        searchValue,
      ),
    )
    .slice(0, 5)
    .map((item) => ({
      id: `local-expense-${item?.id}`,
      name: item?.name || "Expense",
      keywords: [item?.name, item?.description, item?.comments, item?.categoryName],
      category: "Actions",
      section: "Expenses",
      icon: "💸",
      route: item?.id ? `/expenses/${item.id}` : "/expenses",
      priority: 2,
    }));

  const matchedBudgets = normalizeCollection(budgets)
    .filter((item) => buildSearchText(item?.name, item?.categoryName).includes(searchValue))
    .slice(0, 5)
    .map((item) => ({
      id: `local-budget-${item?.id}`,
      name: item?.name || "Budget",
      keywords: [item?.name, item?.categoryName],
      category: "Actions",
      section: "Budgets",
      icon: "📊",
      route: "/budgets",
      priority: 2,
    }));

  const matchedCategories = normalizeCollection(categories)
    .filter((item) => buildSearchText(item?.name, item?.type).includes(searchValue))
    .slice(0, 5)
    .map((item) => ({
      id: `local-category-${item?.id}`,
      name: item?.name || "Category",
      keywords: [item?.name, item?.type],
      category: "Actions",
      section: "Categories",
      icon: "🏷️",
      route: "/categories",
      priority: 3,
    }));

  const matchedBills = normalizeCollection(bills)
    .filter((item) =>
      buildSearchText(item?.name, item?.description, item?.frequency).includes(searchValue),
    )
    .slice(0, 5)
    .map((item) => ({
      id: `local-bill-${item?.id}`,
      name: item?.name || "Bill",
      keywords: [item?.name, item?.description, item?.frequency],
      category: "Actions",
      section: "Bills",
      icon: "🧾",
      route: "/bills",
      priority: 3,
    }));

  const matchedPayments = normalizeCollection(paymentMethods)
    .filter((item) => buildSearchText(item?.name, item?.type).includes(searchValue))
    .slice(0, 5)
    .map((item) => ({
      id: `local-payment-${item?.id}`,
      name: item?.name || "Payment Method",
      keywords: [item?.name, item?.type],
      category: "Actions",
      section: "Payment Methods",
      icon: "💳",
      route: "/payments",
      priority: 3,
    }));

  const matchedFriends = normalizeCollection(friends)
    .filter((item) => {
      const fullName = `${item?.firstName || ""} ${item?.lastName || ""}`.trim();
      return buildSearchText(fullName, item?.email).includes(searchValue);
    })
    .slice(0, 5)
    .map((item) => {
      const fullName = `${item?.firstName || ""} ${item?.lastName || ""}`.trim();
      return {
        id: `local-friend-${item?.id}`,
        name: fullName || item?.email || "Friend",
        keywords: [fullName, item?.email],
        category: "Actions",
        section: "Friends",
        icon: "🤝",
        route: "/friends",
        priority: 3,
      };
    });

  return [
    ...matchedExpenses,
    ...matchedBudgets,
    ...matchedCategories,
    ...matchedBills,
    ...matchedPayments,
    ...matchedFriends,
  ];
}

function dedupeActions(actions) {
  const uniqueMap = new Map();
  actions.forEach((action) => {
    const dedupeKey = `${action?.name || ""}::${action?.route || ""}::${action?.section || ""}`;
    if (!uniqueMap.has(dedupeKey)) {
      uniqueMap.set(dedupeKey, action);
    }
  });
  return Array.from(uniqueMap.values());
}

function buildActionMap(actions) {
  const map = new Map();
  actions.forEach((action) => map.set(action.id, action));
  return map;
}

function getRecentActions(actionMap, currentActions, recentIds) {
  const currentActionIds = new Set(currentActions.map((item) => item.id));
  return recentIds
    .map((id) => actionMap.get(id))
    .filter(Boolean)
    .filter((action) => currentActionIds.has(action.id));
}

function getDefaultGroupedResults(currentActions, recentActions) {
  const baseGroups = groupAndLimit(currentActions, MAX_RESULTS_PER_CATEGORY);
  if (recentActions.length) {
    return {
      Recent: recentActions.slice(0, MAX_RESULTS_PER_CATEGORY),
      Navigation: baseGroups.Navigation || [],
      Actions: baseGroups.Actions || [],
      Settings: baseGroups.Settings || [],
    };
  }

  return {
    Recent: [],
    Navigation: baseGroups.Navigation || [],
    Actions: baseGroups.Actions || [],
    Settings: baseGroups.Settings || [],
  };
}

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
        limit: 20,
      });

      const sections = response?.sections || [];

      if (!active) return;
      setRemoteActions(mapBackendSectionsToActions(sections));
      setRemoteLoading(false);
    }, 160);

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
    return flattenGrouped(source);
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
