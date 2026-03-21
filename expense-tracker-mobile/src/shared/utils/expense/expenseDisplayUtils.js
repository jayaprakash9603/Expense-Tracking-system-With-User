function mergeDefinedOverlay(base, overlay) {
  const out = { ...base };
  if (!overlay || typeof overlay !== "object" || Array.isArray(overlay)) return out;
  for (const key of Object.keys(overlay)) {
    if (overlay[key] !== undefined) out[key] = overlay[key];
  }
  return out;
}

export function extractExpenseDetails(raw) {
  if (!raw || typeof raw !== "object") return {};
  const nested = raw.expense || raw.details;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    return mergeDefinedOverlay(raw, nested);
  }
  return raw;
}

export function resolveExpenseDisplayName(details) {
  if (!details || typeof details !== "object") return "";
  return (
    details.expenseName ||
    details.name ||
    details.itemName ||
    details.title ||
    details.description ||
    ""
  );
}

export function resolveExpenseCategoryLabel(details) {
  if (!details || typeof details !== "object") return "";
  const cat = details.category;
  if (cat && typeof cat === "object" && cat !== null && "name" in cat) {
    return String(cat.name ?? "");
  }
  if (typeof cat === "string" || typeof cat === "number") {
    return String(cat);
  }
  return details.categoryName || "";
}
