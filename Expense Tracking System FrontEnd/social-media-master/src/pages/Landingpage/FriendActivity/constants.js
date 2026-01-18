/**
 * Friend Activity Constants
 * Defines constants used across friend activity components.
 */

// Service types (based on sourceService field)
export const SERVICES = {
  ALL: "all",
  EXPENSE: "EXPENSE",
  BILL: "BILL",
  BUDGET: "BUDGET",
  CATEGORY: "CATEGORY",
  PAYMENT: "PAYMENT",
};

// Entity types (based on entityType field - can differ from sourceService)
export const ENTITY_TYPES = {
  EXPENSE: "EXPENSE",
  BILL: "BILL",
  BUDGET: "BUDGET",
  CATEGORY: "CATEGORY",
  PAYMENT: "PAYMENT",
  PAYMENT_METHOD: "PAYMENT_METHOD",
};

// Service display names
export const SERVICE_LABELS = {
  [SERVICES.ALL]: "All Services",
  [SERVICES.EXPENSE]: "Expenses",
  [SERVICES.BILL]: "Bills",
  [SERVICES.BUDGET]: "Budgets",
  [SERVICES.CATEGORY]: "Categories",
  [SERVICES.PAYMENT]: "Payments",
};

// Entity type display names
export const ENTITY_TYPE_LABELS = {
  [ENTITY_TYPES.EXPENSE]: "Expense",
  [ENTITY_TYPES.BILL]: "Bill",
  [ENTITY_TYPES.BUDGET]: "Budget",
  [ENTITY_TYPES.CATEGORY]: "Category",
  [ENTITY_TYPES.PAYMENT]: "Payment",
  [ENTITY_TYPES.PAYMENT_METHOD]: "Payment Method",
};

// Action types
export const ACTIONS = {
  ALL: "all",
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
};

// Action display names
export const ACTION_LABELS = {
  [ACTIONS.ALL]: "All Actions",
  [ACTIONS.CREATE]: "Created",
  [ACTIONS.UPDATE]: "Updated",
  [ACTIONS.DELETE]: "Deleted",
};

// Read status filters
export const READ_STATUS = {
  ALL: "all",
  READ: "read",
  UNREAD: "unread",
};

// Read status display names
export const READ_STATUS_LABELS = {
  [READ_STATUS.ALL]: "All",
  [READ_STATUS.READ]: "Read",
  [READ_STATUS.UNREAD]: "Unread",
};

// Sort options
export const SORT_OPTIONS = {
  TIMESTAMP: "timestamp",
  ACTION: "action",
  SERVICE: "sourceService",
  AMOUNT: "amount",
  FRIEND: "actorUserName",
};

// Sort display names
export const SORT_LABELS = {
  [SORT_OPTIONS.TIMESTAMP]: "Date",
  [SORT_OPTIONS.ACTION]: "Action",
  [SORT_OPTIONS.SERVICE]: "Service",
  [SORT_OPTIONS.AMOUNT]: "Amount",
  [SORT_OPTIONS.FRIEND]: "Friend Name",
};

// Sort order
export const SORT_ORDER = {
  ASC: "asc",
  DESC: "desc",
};

// Time ranges for filtering
export const TIME_RANGES = {
  ALL: "all",
  TODAY: "today",
  WEEK: "week",
  MONTH: "month",
  CUSTOM: "custom",
};

// Time range display names
export const TIME_RANGE_LABELS = {
  [TIME_RANGES.ALL]: "All Time",
  [TIME_RANGES.TODAY]: "Today",
  [TIME_RANGES.WEEK]: "This Week",
  [TIME_RANGES.MONTH]: "This Month",
  [TIME_RANGES.CUSTOM]: "Custom Range",
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 5,
  PAGE_SIZE_OPTIONS: [5, 10, 15, 20, 50],
};

// Icon mapping for entity types
export const ENTITY_ICONS = {
  EXPENSE: "receipt",
  BILL: "bill",
  BUDGET: "budget",
  CATEGORY: "category",
  PAYMENT: "payment",
};

// Color mapping for actions (for badges/chips)
export const ACTION_COLORS = {
  CREATE: "success",
  UPDATE: "info",
  DELETE: "error",
};

// Default filter state
export const DEFAULT_FILTERS = {
  searchTerm: "",
  serviceFilter: SERVICES.ALL,
  actionFilter: ACTIONS.ALL,
  friendFilter: null,
  timeRange: TIME_RANGES.ALL,
  dateRange: null,
  readStatus: READ_STATUS.ALL,
  sortBy: SORT_OPTIONS.TIMESTAMP,
  sortOrder: SORT_ORDER.DESC,
};
