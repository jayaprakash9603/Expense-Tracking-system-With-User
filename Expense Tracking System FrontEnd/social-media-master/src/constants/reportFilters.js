const DEFAULT_REPORT_TIMEFRAMES = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
  { value: "last_year", label: "Last Year" },
  { value: "all_time", label: "All Time" },
];

const DEFAULT_REPORT_FLOW_TYPES = [
  { value: "all", label: "All" },
  { value: "outflow", label: "Outflow" },
  { value: "inflow", label: "Inflow" },
];

const deepClone = (value) => {
  if (value === null || value === undefined) {
    return value;
  }
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (err) {
    return value;
  }
};

const REPORT_FILTER_DEFAULTS = {
  expenses: {
    timeframe: "month",
    flowType: "all",
    amountRange: null,
    paymentMethods: [],
    dateRange: { fromDate: "", toDate: "" },
  },
  payments: {
    timeframe: "month",
    flowType: "all",
    paymentMethods: [],
    categories: [],
    amountRange: null,
    dateRange: { fromDate: "", toDate: "" },
  },
  categories: {
    timeframe: "month",
    flowType: "all",
    categories: [],
    sortOrder: "desc",
    dateRange: { fromDate: "", toDate: "" },
  },
  budgets: {
    timeframe: "all_time",
    flowType: "loss",
    statuses: ["active", "expired"],
    utilizationRange: { min: 0, max: 100 },
    dateRange: { fromDate: "", toDate: "" },
  },
  singleBudget: {
    timeframe: "budget",
    flowType: "all",
    paymentMethods: [],
    categories: [],
    amountRange: null,
    dateRange: { fromDate: "", toDate: "" },
  },
  bills: {
    timeframe: "this_month",
    flowType: "all",
    category: "all",
    paymentMethods: [],
    amountRange: null,
    dateRange: { fromDate: "", toDate: "" },
  },
};

export const getReportFilterDefaults = (type = "expenses") => {
  const shape = REPORT_FILTER_DEFAULTS[type] || REPORT_FILTER_DEFAULTS.expenses;
  return deepClone(shape);
};

const normalizeOptions = (options = []) => {
  const unique = new Map();
  options
    .filter((opt) => opt !== null && opt !== undefined)
    .forEach((raw) => {
      if (typeof raw === "string") {
        const trimmed = raw.trim();
        if (trimmed.length) {
          unique.set(trimmed, { value: trimmed, label: trimmed });
        }
        return;
      }
      if (typeof raw === "object") {
        const value = raw.value ?? raw.id ?? raw.key ?? raw.name;
        if (!value) {
          return;
        }
        const label = raw.label ?? raw.name ?? String(value);
        unique.set(value, { value, label });
      }
    });
  return Array.from(unique.values());
};

const ensureBounds = (bounds = {}) => {
  const min = Number.isFinite(bounds.min) ? Number(bounds.min) : 0;
  let max;
  if (Number.isFinite(bounds.max) && Number(bounds.max) > min) {
    max = Number(bounds.max);
  } else {
    max = Math.max(min + 1000, 1000);
  }
  const step = Math.max(1, Math.round((max - min) / 20)) || 50;
  return { min, max, step };
};

const createTimeframeSection = (overrides = {}) => ({
  id: "timeframe",
  field: "timeframe",
  label: overrides.label || "Timeframe",
  type: "radio",
  options: overrides.options || DEFAULT_REPORT_TIMEFRAMES,
});

const createFlowTypeSection = (overrides = {}) => ({
  id: "flowType",
  field: "flowType",
  label: overrides.label || "Flow Type",
  type: "radio",
  options: overrides.options || DEFAULT_REPORT_FLOW_TYPES,
});

const createDateRangeSection = (overrides = {}) => ({
  id: "dateRange",
  field: "dateRange",
  label: overrides.label || "Custom Date Range",
  type: "date-range",
  helperText:
    overrides.helperText || "Set a specific range to override timeframe.",
});

const createMultiSelectSection = ({
  id,
  field,
  label,
  options,
  helperText,
}) => {
  const normalized = normalizeOptions(options);
  if (!normalized.length) {
    return null;
  }
  return {
    id,
    field,
    label,
    type: "checkbox-group",
    options: normalized,
    helperText,
  };
};

const createSingleSelectSection = ({
  id,
  field,
  label,
  options,
  helperText,
  defaultOption,
}) => {
  const normalized = normalizeOptions(options);
  const merged = [];
  if (defaultOption) {
    merged.push(defaultOption);
  }
  normalized.forEach((option) => {
    if (!merged.some((entry) => entry.value === option.value)) {
      merged.push(option);
    }
  });
  if (!merged.length) {
    return null;
  }
  return {
    id,
    field,
    label,
    type: "radio",
    options: merged,
    helperText,
  };
};

const createRangeSection = ({ id, field, label, bounds, helperText }) => {
  const normalizedBounds = ensureBounds(bounds);
  return {
    id,
    field,
    label,
    type: "range",
    min: normalizedBounds.min,
    max: normalizedBounds.max,
    step: normalizedBounds.step,
    helperText,
  };
};

const createSortOrderSection = ({
  id = "sortOrder",
  field = "sortOrder",
} = {}) => ({
  id,
  field,
  label: "Sort Order",
  type: "radio",
  options: [
    { value: "desc", label: "Highest First" },
    { value: "asc", label: "Lowest First" },
  ],
});

const createStatusSection = (options) =>
  createMultiSelectSection({
    id: "statuses",
    field: "statuses",
    label: "Budget Status",
    options: options?.length
      ? options
      : [
          { value: "active", label: "Active" },
          { value: "expired", label: "Expired" },
        ],
    helperText: "Toggle the budget lifecycle states you want to analyse.",
  });

export const buildReportFilterSections = (type = "expenses", context = {}) => {
  const sections = [
    createTimeframeSection({ options: context.timeframeOptions }),
    createFlowTypeSection({ options: context.flowTypeOptions }),
  ];

  if (context.enableDateRange !== false) {
    sections.push(createDateRangeSection({ label: context.dateRangeLabel }));
  }

  if (type === "expenses" || type === "bills") {
    const amountSection = createRangeSection({
      id: "amountRange",
      field: "amountRange",
      label: "Total Amount Range",
      bounds: context.amountBounds,
      helperText: "Filter payment groups by their total amount.",
    });
    sections.push(amountSection);
    const methodSection = createMultiSelectSection({
      id: "paymentMethods",
      field: "paymentMethods",
      label: type === "bills" ? "Bill Sources" : "Payment Methods",
      options: context.availableMethods,
      helperText: "Select one or more methods to narrow the report.",
    });
    if (methodSection) {
      sections.push(methodSection);
    }
  }

  if (type === "bills") {
    const categorySection = createSingleSelectSection({
      id: "category",
      field: "category",
      label: "Category",
      options: context.availableCategories,
      helperText: "Limit analytics to a single bill category.",
      defaultOption: { value: "all", label: "All Categories" },
    });
    if (categorySection) {
      sections.push(categorySection);
    }
  }

  if (type === "payments" || type === "singleBudget") {
    const methodSection = createMultiSelectSection({
      id: "paymentMethods",
      field: "paymentMethods",
      label: "Payment Methods",
      options: context.availableMethods,
      helperText: "Choose specific payment methods to focus on.",
    });
    if (methodSection) {
      sections.push(methodSection);
    }
    const categorySection = createMultiSelectSection({
      id: "categories",
      field: "categories",
      label: "Spending Categories",
      options: context.availableCategories,
      helperText: "Limit charts to the categories that matter right now.",
    });
    if (categorySection) {
      sections.push(categorySection);
    }
    const amountSection = createRangeSection({
      id: "amountRange",
      field: "amountRange",
      label: "Total Amount Range",
      bounds: context.amountBounds,
      helperText: "Only include methods whose totals fall inside this range.",
    });
    sections.push(amountSection);
  }

  if (type === "categories") {
    const categorySection = createMultiSelectSection({
      id: "categories",
      field: "categories",
      label: "Categories",
      options: context.availableCategories,
      helperText: "Pick which categories should remain visible.",
    });
    if (categorySection) {
      sections.push(categorySection);
    }
    sections.push(createSortOrderSection());
  }

  if (type === "budgets") {
    const statusSection = createStatusSection(context.statusOptions);
    if (statusSection) {
      sections.push(statusSection);
    }
    sections.push(
      createRangeSection({
        id: "utilizationRange",
        field: "utilizationRange",
        label: "Utilization %",
        bounds: context.utilizationBounds || { min: 0, max: 100 },
        helperText: "Filter budgets by the percentage already spent.",
      })
    );
  }

  return sections.filter(Boolean);
};

export {
  DEFAULT_REPORT_TIMEFRAMES,
  DEFAULT_REPORT_FLOW_TYPES,
  REPORT_FILTER_DEFAULTS,
};
