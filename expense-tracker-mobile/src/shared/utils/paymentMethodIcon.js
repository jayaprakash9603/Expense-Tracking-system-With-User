import {
  Banknote,
  CreditCard,
  Landmark,
  ReceiptText,
  Smartphone,
  Wallet,
  CircleDollarSign,
} from "lucide-react";

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
