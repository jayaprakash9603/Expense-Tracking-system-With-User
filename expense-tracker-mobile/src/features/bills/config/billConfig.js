import { BILL_FREQUENCIES, BILL_STATUSES } from "@/domain/bills/bill.model";

export const BILL_FORM_FIELDS = [
  { name: "name", label: "bills.form.name", type: "text", required: true },
  { name: "amount", label: "bills.form.amount", type: "number", required: true, placeholder: "0.00" },
  { name: "dueDate", label: "bills.form.dueDate", type: "date", required: true },
  { name: "frequency", label: "bills.form.frequency", type: "select", required: true, options: BILL_FREQUENCIES.map((f) => ({ value: f, label: `bills.frequencies.${f.toLowerCase()}` })) },
  { name: "category", label: "bills.form.category", type: "select", required: false, optionsSource: "categories" },
  { name: "reminderDays", label: "bills.form.reminderDays", type: "number", required: false, placeholder: "3" },
  { name: "notes", label: "bills.form.notes", type: "textarea", required: false },
  { name: "autoPay", label: "bills.form.autoPay", type: "switch", required: false },
];

export const BILL_SEARCH_FIELDS = ["name", "category", "notes"];

export const BILL_SORT_OPTIONS = [
  { value: "dueDate", label: "bills.sort.dueDate" },
  { value: "amount", label: "bills.sort.amount" },
  { value: "name", label: "bills.sort.name" },
];

export const BILL_STATUS_COLORS = {
  PENDING: "secondary",
  PAID: "success",
  OVERDUE: "destructive",
  CANCELLED: "outline",
};

export { BILL_STATUSES };
