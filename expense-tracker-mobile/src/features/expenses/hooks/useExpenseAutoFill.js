import { useState, useEffect, useCallback } from "react";
import { extractExpenseDetails } from "@/domain/expenses/expense.utils";
import { normalizePaymentMethod } from "../utils/expensePaymentMethodUtils";

const EMPTY_FLAGS = {
  category: false,
  paymentMethod: false,
  transactionType: false,
  comments: false,
};

export function useExpenseAutoFill(
  previousExpense,
  expenseName,
  formData,
  setFormData,
) {
  const [autoFilledFields, setAutoFilledFields] = useState({ ...EMPTY_FLAGS });
  const [lastAutoFilledName, setLastAutoFilledName] = useState("");
  const [userModifiedFields, setUserModifiedFields] = useState({ ...EMPTY_FLAGS });
  const [autoFillNoticeToken, setAutoFillNoticeToken] = useState(0);

  useEffect(() => {
    const normalizedName = String(expenseName || "").trim();
    if (normalizedName.length < 2) {
      if (!lastAutoFilledName) return;
      setFormData((prev) => ({
        ...prev,
        category: "",
        paymentMethod: "cash",
        transactionType: "loss",
        comments: "",
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
      (!formData.category || (isNewName && !userModifiedFields.category))
    ) {
      updates.category = previousExpense.categoryId;
      nextAutoFilled.category = true;
    }

    if (
      previousDetails.paymentMethod &&
      (!formData.paymentMethod || formData.paymentMethod === "cash" || (isNewName && !userModifiedFields.paymentMethod))
    ) {
      updates.paymentMethod = normalizePaymentMethod(previousDetails.paymentMethod);
      nextAutoFilled.paymentMethod = true;
    }

    if (
      previousDetails.type &&
      (!formData.transactionType || formData.transactionType === "loss" || (isNewName && !userModifiedFields.transactionType))
    ) {
      updates.transactionType = String(previousDetails.type).toLowerCase();
      nextAutoFilled.transactionType = true;
    }

    if (
      previousDetails.comments &&
      (!formData.comments || (isNewName && !userModifiedFields.comments))
    ) {
      updates.comments = previousDetails.comments;
      nextAutoFilled.comments = true;
    } else if (!previousDetails.comments && isNewName && !userModifiedFields.comments) {
      updates.comments = "";
      nextAutoFilled.comments = false;
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
    expenseName,
    formData.category,
    formData.paymentMethod,
    formData.transactionType,
    formData.comments,
    setFormData,
    lastAutoFilledName,
    autoFilledFields,
    userModifiedFields,
  ]);

  const markUserModified = useCallback((field) => {
    setUserModifiedFields((prev) => ({ ...prev, [field]: true }));
    setAutoFilledFields((prev) => ({ ...prev, [field]: false }));
  }, []);

  return { autoFilledFields, userModifiedFields, markUserModified, autoFillNoticeToken };
}

export default useExpenseAutoFill;
