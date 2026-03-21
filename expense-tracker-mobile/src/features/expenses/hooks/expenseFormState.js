import {
  normalizeExpenseDateForForm,
  resolveExpenseFormCategoryFields,
} from "@/domain/expenses/expense.transformers";
import { extractExpenseDetails } from "@/domain/expenses/expense.utils";
import { normalizePaymentMethod } from "../utils/expensePaymentMethodUtils";

export function computeSalaryType(dateValue) {
  if (!dateValue) return "loss";
  const currentDate = new Date(dateValue);
  if (Number.isNaN(currentDate.getTime())) return "loss";
  const lastDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  );
  const salaryDate = new Date(lastDay);
  if (salaryDate.getDay() === 6) salaryDate.setDate(salaryDate.getDate() - 1);
  if (salaryDate.getDay() === 0) salaryDate.setDate(salaryDate.getDate() - 2);
  return currentDate.toDateString() === salaryDate.toDateString() ? "gain" : "loss";
}

export function normalizeExpenseTransactionType(typeValue) {
  const normalized = String(typeValue || "").toLowerCase();
  if (normalized === "gain" || normalized === "inflow" || normalized === "income") {
    return "gain";
  }
  return "loss";
}

export function mapExpenseToFormData(rawExpense, fallbackDate) {
  const details = extractExpenseDetails(rawExpense);
  const resolvedAmount = details.amount ?? rawExpense.amount ?? "";
  const resolvedPaymentMethod = normalizePaymentMethod(
    details.paymentMethod ||
      rawExpense.paymentMethod ||
      rawExpense.paymentMethodInfo?.name ||
      "cash",
  );
  const { category, categoryName } = resolveExpenseFormCategoryFields(rawExpense, details);
  const resolvedDate = normalizeExpenseDateForForm(
    rawExpense.date ?? details.date,
    fallbackDate,
  );
  return {
    expenseName:
      details.expenseName ||
      details.name ||
      rawExpense.expenseName ||
      rawExpense.name ||
      "",
    amount: resolvedAmount === "" ? "" : String(resolvedAmount),
    netAmount:
      details.netAmount != null
        ? String(details.netAmount)
        : resolvedAmount === ""
          ? ""
          : String(resolvedAmount),
    paymentMethod: resolvedPaymentMethod,
    transactionType: normalizeExpenseTransactionType(details.type || rawExpense.type || "loss"),
    comments: details.comments || rawExpense.comments || "",
    date: resolvedDate,
    category,
    categoryName,
    creditDue:
      details.creditDue != null
        ? String(details.creditDue)
        : rawExpense.creditDue != null
          ? String(rawExpense.creditDue)
          : "",
  };
}

export function createEmptyExpenseFormErrors() {
  return {
    expenseName: "",
    amount: "",
    date: "",
    transactionType: "",
  };
}

export function buildEmptyExpenseFormData(initialDate) {
  return {
    expenseName: "",
    amount: "",
    netAmount: "",
    paymentMethod: "cash",
    transactionType: "loss",
    comments: "",
    date: initialDate,
    category: "",
    categoryName: "",
    creditDue: "",
  };
}
