import {
  DEFAULT_ENTITY_COLOR,
  DEFAULT_ENTITY_ICON_SYMBOL,
} from "@/shared/components/entity-form/entityVisualConfig";

export function fromPaymentMethodApiResponse(raw) {
  return {
    id: raw?.id,
    name: raw?.name || "",
    description: raw?.description || "",
    type: String(raw?.type || "expense").toLowerCase(),
    amount: String(raw?.amount ?? ""),
    color: raw?.color || DEFAULT_ENTITY_COLOR,
    icon: raw?.icon || raw?.selectedIconKey || DEFAULT_ENTITY_ICON_SYMBOL,
    isGlobal: Boolean(raw?.isGlobal ?? raw?.global),
  };
}

export function toPaymentMethodApiPayload(formData) {
  const amount = String(formData?.amount ?? "").trim();

  return {
    id: formData?.id ?? null,
    name: formData?.name?.trim() || "",
    description: formData?.description?.trim() || "",
    type: formData?.type || "expense",
    amount: Number.isNaN(Number(amount)) ? 0 : Number(amount),
    color: formData?.color || DEFAULT_ENTITY_COLOR,
    icon: formData?.icon || DEFAULT_ENTITY_ICON_SYMBOL,
    selectedIconKey: formData?.icon || DEFAULT_ENTITY_ICON_SYMBOL,
    isGlobal: Boolean(formData?.isGlobal),
    global: Boolean(formData?.isGlobal),
  };
}

export default {
  fromPaymentMethodApiResponse,
  toPaymentMethodApiPayload,
};
