import { searchApi } from "@/infrastructure/api";

const SECTION_CONFIG = {
  users: { key: "users", label: "Users", fallbackType: "USER" },
  expenses: { key: "expenses", label: "Expenses", fallbackType: "EXPENSE" },
  budgets: { key: "budgets", label: "Budgets", fallbackType: "BUDGET" },
  categories: { key: "categories", label: "Categories", fallbackType: "CATEGORY" },
  bills: { key: "bills", label: "Bills", fallbackType: "BILL" },
  paymentMethods: {
    key: "payment_methods",
    label: "Payment Methods",
    fallbackType: "PAYMENT_METHOD",
  },
  friends: { key: "friends", label: "Friends", fallbackType: "FRIEND" },
  help: { key: "help", label: "Help", fallbackType: "HELP" },
};

function resolveRouteByType(type, id) {
  switch (type) {
    case "EXPENSE":
      return id ? `/expenses/${id}` : "/expenses";
    case "BUDGET":
      return "/budgets";
    case "CATEGORY":
      return "/categories";
    case "BILL":
      return "/bills";
    case "PAYMENT_METHOD":
      return "/payments";
    case "FRIEND":
      return "/friends";
    case "USER":
      return "/admin/users";
    default:
      return "";
  }
}

function normalizeResultItem(raw, fallbackType) {
  if (!raw) return null;

  const itemType = raw.type || fallbackType || "ACTION";
  const itemId = raw.id || raw.key;
  const label = raw.title || raw.label || raw.name || "Result";
  const description = raw.subtitle || raw.description || "";
  const route = raw.route || resolveRouteByType(itemType, itemId);

  return {
    id: itemId,
    key: `${itemType}-${itemId || label}`,
    type: itemType,
    icon: raw.icon,
    color: raw.color,
    title: label,
    subtitle: description,
    label,
    description,
    route,
    metadata: raw.metadata || {},
    searchValue: `${label} ${description}`.trim(),
  };
}

function normalizeSectionItems(items, fallbackType) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => normalizeResultItem(item, fallbackType)).filter(Boolean);
}

export const universalSearchService = {
  async search({ query, limit = 20, mode = "USER", sections } = {}) {
    const { data, error } = await searchApi.search({
      query,
      limit,
      mode,
      sections,
    });

    if (error) {
      return { sections: [], error };
    }

    const payload = data || {};
    const normalizedSections = Object.entries(SECTION_CONFIG)
      .map(([responseKey, config]) => {
        const items = normalizeSectionItems(payload[responseKey], config.fallbackType);
        if (!items.length) return null;
        return {
          key: config.key,
          label: config.label,
          items,
        };
      })
      .filter(Boolean);

    return {
      sections: normalizedSections,
      error: null,
    };
  },
};

export default universalSearchService;
