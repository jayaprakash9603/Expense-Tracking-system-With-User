import { extractExpenseDetails } from "@/shared/utils/expense/expenseDisplayUtils";

export function normalizeFlowExpenseRecords(rawList) {
  if (!Array.isArray(rawList)) return [];
  return rawList.map((exp, index) => {
    const details = extractExpenseDetails(exp);
    return {
      id: exp.id ?? details.id ?? exp.expenseId ?? `flow-exp-${index}`,
      name: details.expenseName || exp.expenseName || exp.name || "Unknown",
      amount: Math.abs(Number(details.amount ?? exp.amount ?? 0)),
      categoryName: exp.categoryName || exp.category || details.categoryName || "",
      paymentMethod: details.paymentMethod || exp.paymentMethod || "",
      date: exp.date || details.date || "",
      type: (details.type || exp.type || "outflow").toString().toLowerCase(),
      comments: details.comments || exp.comments || "",
      description: details.description || exp.description || "",
    };
  });
}
