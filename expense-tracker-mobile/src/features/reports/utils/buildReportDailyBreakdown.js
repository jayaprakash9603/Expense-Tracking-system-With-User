import {
  extractExpenseDetails,
  resolveExpenseCategoryLabel,
  resolveExpensePaymentMethodLabel,
} from "@/shared/utils/expense/expenseDisplayUtils";
import { formatPaymentMethodName } from "@/shared/utils/paymentMethod/paymentMethodDisplay";

function isGainExpense(details) {
  const type = (details?.type ?? "outflow").toString().toLowerCase();
  return ["gain", "income", "inflow"].includes(type);
}

function resolveGroupLabel(details, mode, unknownLabel) {
  if (mode === "category") {
    return resolveExpenseCategoryLabel(details) || unknownLabel;
  }
  const raw = resolveExpensePaymentMethodLabel(details);
  return raw ? formatPaymentMethodName(raw) : unknownLabel;
}

export function buildReportDailyBreakdown(expenses, mode, unknownLabel) {
  const lossMap = new Map();
  const gainMap = new Map();
  const list = Array.isArray(expenses) ? expenses : [];
  for (const raw of list) {
    const details = extractExpenseDetails(raw);
    const amt = Math.abs(Number(details?.amount ?? raw?.amount ?? 0));
    if (!amt) continue;
    const name = resolveGroupLabel(details, mode, unknownLabel);
    const target = isGainExpense(details) ? gainMap : lossMap;
    target.set(name, (target.get(name) || 0) + amt);
  }
  const toSorted = (map) =>
    [...map.entries()]
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  return { lossRows: toSorted(lossMap), gainRows: toSorted(gainMap) };
}
