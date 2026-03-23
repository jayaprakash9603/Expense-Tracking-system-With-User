import {
  DEFAULT_ENTITY_COLOR,
  DEFAULT_ENTITY_ICON_SYMBOL,
} from "@/shared/components/entity-form/entityVisualConfig";

export const CATEGORY_TYPES = ["EXPENSE", "INCOME", "BOTH"];

export const CATEGORY_DEFAULTS = {
  name: "",
  description: "",
  type: "EXPENSE",
  color: DEFAULT_ENTITY_COLOR,
  icon: DEFAULT_ENTITY_ICON_SYMBOL,
  isGlobal: false,
};

export function createCategory(overrides = {}) {
  return { ...CATEGORY_DEFAULTS, ...overrides };
}
