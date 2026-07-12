import {
  DEFAULT_ENTITY_COLOR,
  DEFAULT_ENTITY_ICON_SYMBOL,
} from "@/shared/components/entity-form/entityVisualConfig";

export const PAYMENT_METHOD_TYPES = ["expense", "income", "both"];

export const PAYMENT_METHOD_DEFAULTS = {
  name: "",
  description: "",
  type: "expense",
  amount: "",
  color: DEFAULT_ENTITY_COLOR,
  icon: DEFAULT_ENTITY_ICON_SYMBOL,
  isGlobal: false,
};

export function createPaymentMethod(overrides = {}) {
  return { ...PAYMENT_METHOD_DEFAULTS, ...overrides };
}
