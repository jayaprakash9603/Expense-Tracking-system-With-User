import {
  Banknote,
  CreditCard,
  Landmark,
  ReceiptText,
  Smartphone,
  Wallet,
  CircleDollarSign,
} from "lucide-react";

export function formatPaymentMethodName(name) {
  const normalized = String(name || "")
    .toLowerCase()
    .trim();

  switch (normalized) {
    case "cash":
    case "cash ":
      return "Cash";
    case "creditneedtopaid":
    case "credit due":
    case "credit need to paid":
    case "credit need to pay":
    case "creditneedtopay":
      return "Credit Due";
    case "creditpaid":
    case "credit paid":
      return "Credit Paid";
    default:
      return String(name || "")
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (value) => value.toUpperCase())
        .trim();
  }
}

export function normalizePaymentMethod(name) {
  const raw = String(name || "").trim();
  const key = raw.toLowerCase().replace(/\s+/g, "").replace(/_/g, "");

  switch (key) {
    case "creditneedtopaid":
    case "creditdue":
    case "creditneedtopay":
      return "creditNeedToPaid";
    case "creditpaid":
      return "creditPaid";
    case "cash":
      return "cash";
    default:
      return raw;
  }
}

export function getDefaultPaymentMethods() {
  return [
    { name: "cash", label: "Cash", type: "expense" },
    { name: "creditNeedToPaid", label: "Credit Due", type: "expense" },
    { name: "creditPaid", label: "Credit Paid", type: "expense" },
    { name: "cash", label: "Cash", type: "income" },
    { name: "creditPaid", label: "Credit Paid", type: "income" },
    { name: "creditNeedToPaid", label: "Credit Due", type: "income" },
  ];
}

export function filterPaymentMethodsByType(paymentMethods, transactionType) {
  if (!Array.isArray(paymentMethods) || paymentMethods.length === 0) return [];
  if (transactionType === "gain") return paymentMethods;
  if (transactionType === "loss") {
    return paymentMethods.filter(
      (paymentMethod) =>
        String(paymentMethod?.type || "").toLowerCase() === "expense",
    );
  }
  return paymentMethods;
}

export function transformPaymentMethodToOption(paymentMethod) {
  return {
    value: normalizePaymentMethod(paymentMethod?.name),
    label: formatPaymentMethodName(paymentMethod?.name),
    type: paymentMethod?.type,
    original: paymentMethod,
  };
}

export function processPaymentMethods(
  paymentMethods,
  transactionType,
  useDefaults = true,
) {
  let availableMethods = [];

  if (Array.isArray(paymentMethods) && paymentMethods.length > 0) {
    const filtered = filterPaymentMethodsByType(paymentMethods, transactionType);
    availableMethods = filtered.map(transformPaymentMethodToOption);
  }

  if (availableMethods.length === 0 && useDefaults) {
    const defaults = getDefaultPaymentMethods();
    const filtered = filterPaymentMethodsByType(defaults, transactionType);
    availableMethods = filtered.map(transformPaymentMethodToOption);
  }

  const map = new Map();
  availableMethods.forEach((method) => {
    if (!map.has(method.value)) {
      map.set(method.value, method);
    }
  });

  return Array.from(map.values());
}

export function findPaymentMethodByValue(options, value) {
  if (!Array.isArray(options) || !value) return null;
  const normalized = normalizePaymentMethod(value);
  return options.find((option) => option.value === normalized) || null;
}

export function arePaymentMethodsEqual(option, value) {
  if (!option || !value) return false;
  return option.value === value.value || option.label === value.label;
}

export function getPaymentMethodDisplayLabel(paymentMethod) {
  if (!paymentMethod) return "";
  if (typeof paymentMethod === "string") return formatPaymentMethodName(paymentMethod);
  return (
    paymentMethod.label ||
    formatPaymentMethodName(paymentMethod.value || paymentMethod.name || "")
  );
}

export function getPaymentMethodIcon(iconKey) {
  const normalized = String(iconKey || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/_/g, "");

  if (normalized.includes("cash")) return Banknote;
  if (normalized.includes("credit") || normalized.includes("card")) return CreditCard;
  if (normalized.includes("upi") || normalized.includes("phone")) return Smartphone;
  if (normalized.includes("bank") || normalized.includes("neft") || normalized.includes("rtgs")) {
    return Landmark;
  }
  if (normalized.includes("wallet")) return Wallet;
  if (normalized.includes("check") || normalized.includes("cheque")) return ReceiptText;
  return CircleDollarSign;
}
