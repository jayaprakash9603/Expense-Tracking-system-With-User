import { BILL_DEFAULTS } from "@/domain/bills/bill.model";

export function buildEmptyBillFormData(initialDate) {
  return {
    ...BILL_DEFAULTS,
    date: initialDate || "",
  };
}

export function createEmptyBillFormErrors() {
  return {
    name: "",
    date: "",
    type: "",
    amount: "",
    categoryId: "",
  };
}
