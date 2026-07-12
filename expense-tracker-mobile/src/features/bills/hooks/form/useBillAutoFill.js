import { useState, useEffect, useCallback } from "react";
import { extractExpenseDetails } from "@/domain/expenses/expense.utils";
import { normalizePaymentMethod } from "@/domain/shared/paymentMethod.utils";
import { normalizeExpenseTransactionType } from "@/domain/expenses/expenseTransaction.utils";

const EMPTY_FLAGS = {
  categoryId: false,
  paymentMethod: false,
  type: false,
  description: false,
};

export function useBillAutoFill(previousExpense, billName, formData, setFormData) {
  const [autoFilledFields, setAutoFilledFields] = useState({ ...EMPTY_FLAGS });
  const [lastAutoFilledName, setLastAutoFilledName] = useState("");
  const [userModifiedFields, setUserModifiedFields] = useState({ ...EMPTY_FLAGS });
  const [autoFillNoticeToken, setAutoFillNoticeToken] = useState(0);

  useEffect(() => {
    const normalizedName = String(billName || "").trim();
    if (normalizedName.length < 2) {
      if (!lastAutoFilledName) return;
      setFormData((prev) => ({
        ...prev,
        categoryId: "",
        paymentMethod: "cash",
        type: "loss",
        description: "",
      }));
      setLastAutoFilledName("");
      setAutoFilledFields({ ...EMPTY_FLAGS });
      setUserModifiedFields({ ...EMPTY_FLAGS });
      return;
    }

    if (!previousExpense) return;
    const previousDetails = extractExpenseDetails(previousExpense);
    const isNewName = normalizedName !== lastAutoFilledName;
    const updates = {};
    const nextAutoFilled = { ...autoFilledFields };

    if (
      previousExpense.categoryId &&
      (!formData.categoryId || (isNewName && !userModifiedFields.categoryId))
    ) {
      updates.categoryId = String(previousExpense.categoryId);
      nextAutoFilled.categoryId = true;
    }

    if (
      previousDetails.paymentMethod &&
      (!formData.paymentMethod ||
        formData.paymentMethod === "cash" ||
        (isNewName && !userModifiedFields.paymentMethod))
    ) {
      updates.paymentMethod = normalizePaymentMethod(previousDetails.paymentMethod);
      nextAutoFilled.paymentMethod = true;
    }

    if (
      previousDetails.type &&
      (!formData.type ||
        formData.type === "loss" ||
        (isNewName && !userModifiedFields.type))
    ) {
      updates.type = normalizeExpenseTransactionType(previousDetails.type);
      nextAutoFilled.type = true;
    }

    if (
      previousDetails.comments &&
      (!formData.description || (isNewName && !userModifiedFields.description))
    ) {
      updates.description = previousDetails.comments;
      nextAutoFilled.description = true;
    } else if (!previousDetails.comments && isNewName && !userModifiedFields.description) {
      updates.description = "";
      nextAutoFilled.description = false;
    }

    if (Object.keys(updates).length === 0) return;
    setFormData((prev) => ({ ...prev, ...updates }));
    setAutoFilledFields(nextAutoFilled);
    setLastAutoFilledName(normalizedName);
    setAutoFillNoticeToken((n) => n + 1);
    if (isNewName) {
      setUserModifiedFields({ ...EMPTY_FLAGS });
    }
  }, [
    previousExpense,
    billName,
    formData.categoryId,
    formData.paymentMethod,
    formData.type,
    formData.description,
    setFormData,
    lastAutoFilledName,
    autoFilledFields,
    userModifiedFields,
  ]);

  const markUserModified = useCallback((field) => {
    setUserModifiedFields((prev) => ({ ...prev, [field]: true }));
    setAutoFilledFields((prev) => ({ ...prev, [field]: false }));
  }, []);

  return { autoFilledFields, markUserModified, autoFillNoticeToken };
}

export default useBillAutoFill;
