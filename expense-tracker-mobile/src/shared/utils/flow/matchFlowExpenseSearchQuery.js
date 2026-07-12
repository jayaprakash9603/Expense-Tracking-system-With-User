import { getFuzzyMatchIndices } from "@/shared/utils/fuzzy/expenseFuzzyUtils";

export function matchFlowExpenseSearchQuery(row, rawQuery) {
  const q = String(rawQuery ?? "").trim();
  if (!q) return true;
  const blob = [
    row.name,
    row.description,
    row.comments,
    row.categoryName,
    row.paymentMethod,
    String(row.amount ?? ""),
    row.type,
  ]
    .filter(Boolean)
    .join(" ");
  return getFuzzyMatchIndices(blob, q) != null;
}
