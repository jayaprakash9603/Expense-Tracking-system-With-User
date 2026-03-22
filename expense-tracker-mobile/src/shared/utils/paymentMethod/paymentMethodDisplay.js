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
