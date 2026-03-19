export const CATEGORY_TYPES = ["EXPENSE", "INCOME", "BOTH"];

export const CATEGORY_DEFAULTS = {
  name: "",
  description: "",
  type: "EXPENSE",
  color: "#00b8a0",
  icon: "📦",
  isGlobal: false,
};

export function createCategory(overrides = {}) {
  return { ...CATEGORY_DEFAULTS, ...overrides };
}
