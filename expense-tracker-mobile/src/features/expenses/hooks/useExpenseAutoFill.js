import { useState, useEffect, useCallback, useRef } from "react";
import { extractExpenseDetails } from "@/domain/expenses/expense.utils";
import { normalizePaymentMethod } from "../utils/expensePaymentMethodUtils";

const EMPTY_FLAGS = {
  category: false,
  paymentMethod: false,
  transactionType: false,
  comments: false,
};

const AUTO_FILL_CLEAR_DELAY = 3000;

export function useExpenseAutoFill(
  previousExpense,
  expenseName,
  formData,
  setFormData,
) {
  const [autoFilledFields, setAutoFilledFields] = useState({ ...EMPTY_FLAGS });
  const [lastAutoFilledName, setLastAutoFilledName] = useState("");
  const [userModifiedFields, setUserModifiedFields] = useState({ ...EMPTY_FLAGS });
  const timeoutRef = useRef(null);

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
    if (isNewName) {
      setUserModifiedFields({ ...EMPTY_FLAGS });
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setAutoFilledFields({ ...EMPTY_FLAGS });
    }, AUTO_FILL_CLEAR_DELAY);
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

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const markUserModified = useCallback((field) => {
    setUserModifiedFields((prev) => ({ ...prev, [field]: true }));
    setAutoFilledFields((prev) => ({ ...prev, [field]: false }));
  }, []);

  return { autoFilledFields, userModifiedFields, markUserModified };
}

export default useExpenseAutoFill;
