import { MAX_RESULTS_PER_CATEGORY, groupAndLimit } from "../utils/ranking";
import {
  LOCAL_ENTITY_SLICE_LIMIT,
  MIN_REMOTE_QUERY_LENGTH,
} from "./commandPaletteConstants";

export function normalizeCollection(value) {
  if (Array.isArray(value)) return value;
  return [];
}

export function buildSearchText(...values) {
  return values
    .filter(Boolean)
    .map((value) => String(value))
    .join(" ")
    .toLowerCase();
}

export function mapBackendItemTypeToIcon(type, sectionKey) {
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

export function mapBackendSectionsToActions(sections, currencySymbol = "$") {
  if (!Array.isArray(sections)) return [];

  return sections.flatMap((section) => {
    const sectionKey = section?.key || "search";
    const sectionLabel = section?.label || "Search";
    return normalizeCollection(section?.items).map((item) => {
      const type = item?.type || "ACTION";
      const name = item?.title || item?.label || "Result";
      const description = item?.subtitle || item?.description || "";
      let category = sectionLabel;
      if (sectionKey === "help") category = "Settings";
      else if (sectionKey === "search") category = "Actions";
      
      const metadata = item?.metadata || {};
      
      return {
        id: `api-${sectionKey}-${item?.id || name}`,
        name,
        subtitle: description,
        keywords: [name, description, type, sectionLabel],
        category,
        section: sectionLabel,
        icon: item?.icon || mapBackendItemTypeToIcon(type, sectionKey),
        route: item?.route || "",
        priority: 2,
        isRemote: true,
        type: type,
        amount: metadata?.amount != null ? (metadata.amount < 0 ? `-${currencySymbol}${Math.abs(metadata.amount).toFixed(2)}` : `${currencySymbol}${metadata.amount.toFixed(2)}`) : null,
        date: metadata?.date,
        isGain: metadata?.type?.toLowerCase() === "gain",
      };
    });
  });
}

export function filterLocalEntityActions({
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
    .slice(0, LOCAL_ENTITY_SLICE_LIMIT)
    .map((item) => ({
      id: `local-expense-${item?.id}`,
      name: item?.name || "Expense",
      subtitle: item?.comments || item?.description || "",
      keywords: [item?.name, item?.description, item?.comments, item?.categoryName],
      category: "Actions",
      section: "Expenses",
      icon: "💸",
      route: item?.id ? `/expenses/${item.id}` : "/expenses",
      priority: 2,
    }));

  const matchedBudgets = normalizeCollection(budgets)
    .filter((item) => buildSearchText(item?.name, item?.categoryName).includes(searchValue))
    .slice(0, LOCAL_ENTITY_SLICE_LIMIT)
    .map((item) => ({
      id: `local-budget-${item?.id}`,
      name: item?.name || "Budget",
      subtitle: item?.categoryName || "",
      keywords: [item?.name, item?.categoryName],
      category: "Actions",
      section: "Budgets",
      icon: "📊",
      route: "/budgets",
      priority: 2,
    }));

  const matchedCategories = normalizeCollection(categories)
    .filter((item) => buildSearchText(item?.name, item?.type).includes(searchValue))
    .slice(0, LOCAL_ENTITY_SLICE_LIMIT)
    .map((item) => ({
      id: `local-category-${item?.id}`,
      name: item?.name || "Category",
      subtitle: item?.type || "",
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
    .slice(0, LOCAL_ENTITY_SLICE_LIMIT)
    .map((item) => ({
      id: `local-bill-${item?.id}`,
      name: item?.name || "Bill",
      subtitle: item?.description || item?.frequency || "",
      keywords: [item?.name, item?.description, item?.frequency],
      category: "Actions",
      section: "Bills",
      icon: "🧾",
      route: "/bills",
      priority: 3,
    }));

  const matchedPayments = normalizeCollection(paymentMethods)
    .filter((item) => buildSearchText(item?.name, item?.type).includes(searchValue))
    .slice(0, LOCAL_ENTITY_SLICE_LIMIT)
    .map((item) => ({
      id: `local-payment-${item?.id}`,
      name: item?.name || "Payment Method",
      subtitle: item?.type || "",
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
    .slice(0, LOCAL_ENTITY_SLICE_LIMIT)
    .map((item) => {
      const fullName = `${item?.firstName || ""} ${item?.lastName || ""}`.trim();
      return {
        id: `local-friend-${item?.id}`,
        name: fullName || item?.email || "Friend",
        subtitle: item?.email || "",
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

export function dedupeActions(actions) {
  const uniqueMap = new Map();
  actions.forEach((action) => {
    // Dedupe by ID if available, otherwise by name and section
    const dedupeKey = action.id ? `id::${action.id}` : `${action?.name || ""}::${action?.section || ""}`;
    if (!uniqueMap.has(dedupeKey)) {
      uniqueMap.set(dedupeKey, action);
    }
  });
  return Array.from(uniqueMap.values());
}

export function buildActionMap(actions) {
  const map = new Map();
  actions.forEach((action) => map.set(action.id, action));
  return map;
}

export function getRecentActions(actionMap, currentActions, recentIds) {
  const currentActionIds = new Set(currentActions.map((item) => item.id));
  return recentIds
    .map((id) => actionMap.get(id))
    .filter(Boolean)
    .filter((action) => currentActionIds.has(action.id));
}

export function getDefaultGroupedResults(currentActions, recentActions) {
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
