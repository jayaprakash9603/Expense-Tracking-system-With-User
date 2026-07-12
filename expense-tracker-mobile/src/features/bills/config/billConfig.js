import { BILL_FREQUENCIES, BILL_STATUSES } from "@/domain/bills/bill.model";

export const BILL_FORM_MODE_CONFIG = {
  create: {
    titleKey: "billForm.create.title",
    submitLabelKey: "billForm.create.submit",
    successMessageKey: "billForm.create.success",
  },
  edit: {
    titleKey: "billForm.edit.title",
    submitLabelKey: "billForm.edit.submit",
    successMessageKey: "billForm.edit.success",
  },
};

export const BILL_FORM_LABELS = {
  name: "billForm.fields.name",
  description: "billForm.fields.description",
  amount: "billForm.fields.amount",
  totalFromLines: "billForm.fields.totalFromLines",
  date: "billForm.fields.date",
  type: "billForm.fields.type",
  paymentMethod: "billForm.fields.paymentMethod",
  category: "billForm.fields.category",
};

export const BILL_FORM_PLACEHOLDERS = {
  name: "billForm.placeholders.name",
  description: "billForm.placeholders.description",
  amount: "billForm.placeholders.amount",
  date: "billForm.placeholders.date",
  type: "billForm.placeholders.type",
  paymentMethod: "billForm.placeholders.paymentMethod",
  category: "billForm.placeholders.category",
};

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

export const BILL_EXPENSE_SCROLL = {
  summaryList: "max-h-[min(45vh,17rem)] overflow-y-auto overscroll-y-contain",
  editorList: "max-h-[min(45vh,17rem)] overflow-y-auto overscroll-y-contain",
};

export const BILL_SEARCH_FIELDS = ["name", "description"];

export const BILL_SORT_OPTIONS = [
  { value: "date", label: "bills.sort.date" },
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
