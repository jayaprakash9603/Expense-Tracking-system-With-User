import { BUDGET_PERIODS } from "@/domain/budgets/budget.model";

export const BUDGET_FORM_FIELDS = [
  { name: "name", label: "budgets.form.name", type: "text", required: true },
  { name: "amount", label: "budgets.form.amount", type: "number", required: true, placeholder: "0.00" },
  { name: "period", label: "budgets.form.period", type: "select", required: true, options: BUDGET_PERIODS.map((p) => ({ value: p, label: `budgets.periods.${p.toLowerCase()}` })) },
  { name: "category", label: "budgets.form.category", type: "select", required: false, optionsSource: "categories" },
  { name: "startDate", label: "budgets.form.startDate", type: "date", required: true },
  { name: "endDate", label: "budgets.form.endDate", type: "date", required: false },
  { name: "alertThreshold", label: "budgets.form.alertThreshold", type: "number", required: false, placeholder: "80" },
];

export const BUDGET_SCROLL_CHUNK_SIZE = 12;

export const BUDGET_SEARCH_FIELDS = ["name", "category"];

export const BUDGET_SORT_OPTIONS = [
  { value: "name", label: "budgets.sort.name" },
  { value: "amount", label: "budgets.sort.amount" },
  { value: "period", label: "budgets.sort.period" },
];
