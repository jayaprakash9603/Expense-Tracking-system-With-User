import { extractExpenseDetails } from "@/domain/expenses/expense.utils";
import { normalizeApiListOrObjectArrays } from "@/shared/utils/api/normalizeApiList";

function resolveCategoryId(row, details) {
  if (row?.categoryId != null && row.categoryId !== "") return row.categoryId;
  if (details?.categoryId != null && details.categoryId !== "") return details.categoryId;
  const cat = row?.category ?? details?.category;
  if (cat && typeof cat === "object" && cat !== null && "id" in cat) {
    return cat.id;
  }
  return null;
}

export function normalizeExpenseRowsForLinkTable(data) {
  const base = normalizeApiListOrObjectArrays(data, "content", "expenses");

  return base
    .map((row) => {
      const details = extractExpenseDetails(row);
      const id = details?.id ?? row?.id;
      if (!id) return null;
      return {
        id,
        expenseName: details?.expenseName || details?.name || row?.expenseName || row?.name || "",
        date: details?.date || row?.date || "",
        amount: details?.amount ?? row?.amount ?? 0,
        type: details?.type || row?.type || "",
        categoryName:
          row?.categoryName || details?.categoryName || row?.category || details?.category || "",
        categoryId: resolveCategoryId(row, details),
        paymentMethod:
          details?.paymentMethod ||
          row?.paymentMethod ||
          row?.paymentMethodInfo?.name ||
          details?.paymentMethodInfo?.name ||
          "",
        comments: details?.comments ?? row?.comments ?? "",
      };
    })
    .filter(Boolean);
}
