import { normalizePaymentMethod } from "@/domain/shared/paymentMethod.utils";
import { normalizeExpenseDateForForm } from "@/domain/expenses/expense.transformers";
import { computeBillExpensesTotal, resolveExpensesFromApi } from "./billExpenseLineUtils";

function normalizeBudgetIds(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "object" && raw instanceof Set) return [...raw];
  return [];
}

export function fromApiResponse(raw, fallbackDate = "") {
  const amountRaw = raw.amount ?? 0;
  const expenses = resolveExpensesFromApi(raw);
  const totalFromLines = computeBillExpensesTotal(expenses);
  const amountStr =
    expenses.length > 0 ? String(totalFromLines) : amountRaw === "" ? "" : String(amountRaw);
  const dateValue = normalizeExpenseDateForForm(raw.date, fallbackDate);
  const netNum = raw.netAmount != null && raw.netAmount !== "" ? Number(raw.netAmount) : null;
  const creditNum = raw.creditDue != null && raw.creditDue !== "" ? Number(raw.creditDue) : null;
  const typeLower = String(raw.type || "loss").toLowerCase();
  const absAmt = Math.abs(Number(amountStr) || 0);
  const defaultNet = typeLower === "gain" ? absAmt : -absAmt;
  const descriptionText = raw.description ?? raw.notes ?? "";
  return {
    id: raw.id,
    name: raw.name || raw.billName || raw.title || "",
    description: String(descriptionText || "").trim(),
    amount: amountStr,
    date: dateValue,
    type: typeLower,
    paymentMethod: normalizePaymentMethod(raw.paymentMethod || "cash"),
    categoryId: raw.categoryId != null && raw.categoryId !== 0 ? String(raw.categoryId) : "",
    expenses,
    budgetIds: normalizeBudgetIds(raw.budgetIds),
    netAmount: netNum != null && !Number.isNaN(netNum) ? netNum : defaultNet,
    creditDue: creditNum != null && !Number.isNaN(creditNum) ? creditNum : 0,
  };
}

export function toListItem(raw) {
  const bill = fromApiResponse(raw);
  const dateStr = bill.date || "";
  const dueDate = dateStr;
  const status = raw.status || "PENDING";
  const isPaid = status === "PAID";
  const overdue =
    !isPaid &&
    dateStr &&
    (() => {
      const d = new Date(dateStr);
      return !Number.isNaN(d.getTime()) && d < new Date(new Date().toDateString());
    })();
  const flowType = bill.type === "gain" ? "gain" : "loss";
  return {
    id: bill.id,
    title: bill.name,
    subtitle: bill.description || raw.notes || bill.type || "",
    amount: Number(bill.amount) || 0,
    dueDate,
    date: dateStr,
    status: isPaid ? "PAID" : overdue ? "OVERDUE" : "PENDING",
    isOverdue: overdue,
    flowType,
  };
}
