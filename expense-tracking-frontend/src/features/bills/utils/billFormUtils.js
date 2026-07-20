import { normalizePaymentMethod } from "../../../utils/domain/paymentMethodUtils";

export const REDIRECT_CONFIG = {
  buildFriendPath: (fid) => `/bill/${fid}`,
  selfPath: "/bill",
  defaultPath: "/bill",
};

export const TYPE_OPTIONS = ["gain", "loss"];

export const EMPTY_TEMP_ROW = {
  itemName: "",
  quantity: 1,
  unitPrice: "",
  totalPrice: 0,
  comments: "",
};

export function validateBillFields(billData) {
  const errors = {};
  if (!billData.name) errors.name = true;
  if (!billData.date) errors.date = true;
  if (!billData.type) errors.type = true;
  return errors;
}

function isExpenseNumericValid(exp) {
  return (
    exp.unitPrice !== "" &&
    !isNaN(parseFloat(exp.unitPrice)) &&
    parseFloat(exp.unitPrice) > 0 &&
    !exp.unitPrice.toString().includes("-") &&
    exp.quantity !== "" &&
    !isNaN(parseFloat(exp.quantity)) &&
    parseFloat(exp.quantity) > 0 &&
    !exp.quantity.toString().includes("-")
  );
}

export function filterValidExpenses(expenses) {
  return expenses.filter(
    (exp) => exp.itemName.trim() !== "" && isExpenseNumericValid(exp),
  );
}

export function filterInvalidExpenses(expenses) {
  return expenses.filter(
    (exp) => exp.itemName.trim() !== "" && !isExpenseNumericValid(exp),
  );
}

export function computeTotalAmount(expenses) {
  return expenses.reduce((sum, exp) => sum + (exp.totalPrice || 0), 0);
}

export function computeCreditDue(type, paymentMethod, totalAmount) {
  const normalized = normalizePaymentMethod(paymentMethod);
  return type === "loss" && normalized === "creditNeedToPaid" ? totalAmount : 0;
}

export function buildCreatePayload(billData, validExpenses, selectedBudgets) {
  const totalAmount = computeTotalAmount(validExpenses);
  const normalizedMethod = normalizePaymentMethod(billData.paymentMethod);

  return {
    name: billData.name.trim(),
    description: billData.description?.trim() || "",
    amount: totalAmount,
    netAmount: totalAmount,
    paymentMethod: normalizedMethod,
    type: billData.type,
    date: billData.date,
    categoryId: billData.categoryId || 0,
    expenses: validExpenses.map((exp) => ({
      itemName: exp.itemName.trim(),
      quantity: parseFloat(exp.quantity),
      unitPrice: parseFloat(exp.unitPrice),
      totalPrice: exp.totalPrice,
      comments: exp.comments?.trim() || "",
    })),
    budgetIds: selectedBudgets || [],
    creditDue: computeCreditDue(billData.type, billData.paymentMethod, totalAmount),
    includeInBudget: selectedBudgets.length > 0,
  };
}

export function buildUpdatePayload(billId, billData, expenses, selectedBudgets) {
  const totalAmount = computeTotalAmount(expenses);
  const normalizedMethod = normalizePaymentMethod(billData.paymentMethod);

  return {
    id: billId,
    name: billData.name,
    description: billData.description,
    amount: totalAmount,
    paymentMethod: normalizedMethod,
    type: billData.type,
    date: billData.date,
    categoryId: billData.categoryId || 0,
    budgetIds: selectedBudgets || [],
    expenses,
    netAmount: totalAmount,
    creditDue: computeCreditDue(billData.type, billData.paymentMethod, totalAmount),
  };
}

export function mapBillResponseToFormData(bill) {
  return {
    name: bill.name || "",
    description: bill.description || "",
    amount: bill.amount?.toString() || "0",
    paymentMethod: normalizePaymentMethod(bill.paymentMethod || "cash"),
    type: bill.type || "loss",
    date: bill.date || "",
    categoryId: bill.categoryId || "",
  };
}

export function mapBillResponseToExpenses(bill) {
  if (!bill.expenses?.length) return [];
  return bill.expenses.map((exp) => ({
    itemName: exp.itemName || exp.expenseName || "",
    quantity: exp.quantity || 1,
    unitPrice: exp.unitPrice?.toString() || exp.amount?.toString() || "",
    totalPrice: exp.totalPrice || exp.amount || 0,
    comments: exp.comments || "",
  }));
}
