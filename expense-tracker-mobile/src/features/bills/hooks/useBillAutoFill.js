import { useState, useEffect, useCallback, useRef } from "react";
import { extractExpenseDetails } from "@/domain/expenses/expense.utils";
import { normalizePaymentMethod } from "@/features/expenses/utils/expensePaymentMethodUtils";
import { normalizeExpenseTransactionType } from "@/features/expenses/hooks/expenseFormState";

const EMPTY_FLAGS = {
  categoryId: false,
  paymentMethod: false,
  type: false,
  description: false,
};

const AUTO_FILL_CLEAR_DELAY = 3000;

export function useBillAutoFill(previousExpense, billName, formData, setFormData) {
  const [autoFilledFields, setAutoFilledFields] = useState({ ...EMPTY_FLAGS });
  const [lastAutoFilledName, setLastAutoFilledName] = useState("");
  const [userModifiedFields, setUserModifiedFields] = useState({ ...EMPTY_FLAGS });
  const timeoutRef = useRef(null);

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

  return { autoFilledFields, markUserModified };
}

export default useBillAutoFill;
