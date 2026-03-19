export function fromApiResponse(raw) {
  return {
    id: raw.id,
    name: raw.name || raw.categoryName || "",
    description: raw.description || "",
    type: raw.type || "EXPENSE",
    color: raw.color || "#00b8a0",
    icon: raw.icon || raw.selectedIconKey || "📦",
    isGlobal: Boolean(raw.isGlobal),
    expenseCount: Number(raw.expenseCount || 0),
    totalAmount: Number(raw.totalAmount || 0),
  };
}

export function toApiPayload(formData) {
  return {
    name: formData.name?.trim(),
    description: formData.description?.trim() || "",
    type: formData.type,
    color: formData.color,
    selectedIconKey: formData.icon,
    isGlobal: formData.isGlobal || false,
  };
}

export function toListItem(category) {
  return {
    id: category.id,
    title: category.name,
    subtitle: category.type,
    color: category.color,
    icon: category.icon,
    count: category.expenseCount,
    total: category.totalAmount,
  };
}

export function toCategoryBreakdownPieData(categories, expenseMap = {}) {
  return categories
    .map((c) => ({
      name: c.name,
      value: Number(expenseMap[c.name] || expenseMap[c.id] || 0),
    }))
    .filter((d) => d.value > 0);
}
