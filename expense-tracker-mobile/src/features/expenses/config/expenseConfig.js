import { EXPENSE_TYPES, PAYMENT_METHODS } from "@/domain/expenses/expense.model";

export const EXPENSE_FORM_MODE_CONFIG = {
  create: {
    titleKey: "expenseForm.create.title",
    submitLabelKey: "expenseForm.create.submit",
    successMessageKey: "expenseForm.create.success",
  },
  edit: {
    titleKey: "expenseForm.edit.title",
    submitLabelKey: "expenseForm.edit.submit",
    successMessageKey: "expenseForm.edit.success",
  },
};

export const EXPENSE_FORM_VALIDATION_MESSAGES = {
  expenseName: "Expense name is required",
  amount: "Enter a valid amount",
  date: "Date is required",
  transactionType: "Type is required",
};

export const EXPENSE_FORM_LABELS = {
  expenseName: "expenseForm.fields.expenseName",
  amount: "expenseForm.fields.amount",
  date: "expenseForm.fields.date",
  transactionType: "expenseForm.fields.transactionType",
  category: "expenseForm.fields.category",
  paymentMethod: "expenseForm.fields.paymentMethod",
  comments: "expenseForm.fields.comments",
};

export const EXPENSE_FORM_PLACEHOLDERS = {
  expenseName: "expenseForm.placeholders.expenseName",
  amount: "expenseForm.placeholders.amount",
  date: "expenseForm.placeholders.date",
  transactionType: "expenseForm.placeholders.transactionType",
  category: "expenseForm.placeholders.category",
  paymentMethod: "expenseForm.placeholders.paymentMethod",
  comments: "expenseForm.placeholders.comments",
};

export const EXPENSE_TYPE_OPTIONS = ["gain", "loss"];

export const EXPENSE_FORM_FIELDS = [
  { name: "name", label: "expenses.form.name", type: "text", required: true, placeholder: "expenses.form.namePlaceholder" },
  { name: "amount", label: "expenses.form.amount", type: "number", required: true, placeholder: "0.00" },
  { name: "date", label: "expenses.form.date", type: "date", required: true },
  { name: "category", label: "expenses.form.category", type: "select", required: true, optionsSource: "categories" },
  { name: "type", label: "expenses.form.type", type: "select", required: false, options: EXPENSE_TYPES.map((t) => ({ value: t, label: `expenses.types.${t.toLowerCase()}` })) },
  { name: "paymentMethod", label: "expenses.form.paymentMethod", type: "select", required: false, options: PAYMENT_METHODS.map((m) => ({ value: m, label: `expenses.paymentMethods.${m.toLowerCase()}` })) },
  { name: "comments", label: "expenses.form.comments", type: "textarea", required: false, placeholder: "expenses.form.commentsPlaceholder" },
  { name: "tags", label: "expenses.form.tags", type: "tags", required: false },
  { name: "isRecurring", label: "expenses.form.recurring", type: "switch", required: false },
];

export const EXPENSE_SORT_OPTIONS = [
  { value: "date", label: "expenses.sort.date" },
  { value: "amount", label: "expenses.sort.amount" },
  { value: "name", label: "expenses.sort.name" },
  { value: "category", label: "expenses.sort.category" },
];

export const EXPENSE_FILTER_OPTIONS = {
  types: EXPENSE_TYPES,
  paymentMethods: PAYMENT_METHODS,
  dateRanges: ["today", "this_week", "this_month", "last_month", "custom"],
};

export const EXPENSE_SEARCH_FIELDS = ["name", "category", "comments"];

export const EXPENSE_LIST_COLUMNS = [
  { key: "name", label: "expenses.columns.name", sortable: true },
  { key: "amount", label: "expenses.columns.amount", sortable: true },
  { key: "category", label: "expenses.columns.category", sortable: true },
  { key: "date", label: "expenses.columns.date", sortable: true },
  { key: "type", label: "expenses.columns.type", sortable: false },
];
