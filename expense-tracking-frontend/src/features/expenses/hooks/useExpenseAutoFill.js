import { useState, useEffect, useCallback } from "react";

const EMPTY_FLAGS = {
  category: false,
  paymentMethod: false,
  transactionType: false,
  comments: false,
};

const AUTO_FILL_CLEAR_DELAY = 3000;

export default function useExpenseAutoFill(
  previousExpense,
  expenseName,
  formData,
  setFormData,
) {
  const [autoFilledFields, setAutoFilledFields] = useState({ ...EMPTY_FLAGS });
  const [lastAutoFilledName, setLastAutoFilledName] = useState("");
  const [userModifiedFields, setUserModifiedFields] = useState({ ...EMPTY_FLAGS });

  useEffect(() => {
    if (!expenseName || expenseName.trim().length < 2) {
      if (lastAutoFilledName) {
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
      }
      return;
    }

    if (previousExpense && expenseName?.trim().length >= 2) {
      const isNewName = expenseName.trim() !== lastAutoFilledName;
      const updates = {};
      const newAutoFilled = { ...autoFilledFields };

      if (
        previousExpense.categoryId &&
        (!formData.category || (isNewName && !userModifiedFields.category))
      ) {
        updates.category = previousExpense.categoryId;
        newAutoFilled.category = true;
      }

      if (
        previousExpense.expense?.paymentMethod &&
        (formData.paymentMethod === "cash" ||
          (isNewName && !userModifiedFields.paymentMethod))
      ) {
        updates.paymentMethod = previousExpense.expense.paymentMethod;
        newAutoFilled.paymentMethod = true;
      }

      if (
        previousExpense.expense?.type &&
        (formData.transactionType === "loss" ||
          (isNewName && !userModifiedFields.transactionType))
      ) {
        updates.transactionType = previousExpense.expense.type;
        newAutoFilled.transactionType = true;
      }

      if (
        previousExpense.expense?.comments &&
        (!formData.comments || (isNewName && !userModifiedFields.comments))
      ) {
        updates.comments = previousExpense.expense.comments;
        newAutoFilled.comments = true;
      } else if (
        !previousExpense.expense?.comments &&
        isNewName &&
        !userModifiedFields.comments
      ) {
        updates.comments = "";
        newAutoFilled.comments = false;
      }

      if (Object.keys(updates).length > 0) {
        setFormData((prev) => ({ ...prev, ...updates }));
        setAutoFilledFields(newAutoFilled);
        setLastAutoFilledName(expenseName.trim());

        if (isNewName) {
          setUserModifiedFields({ ...EMPTY_FLAGS });
        }

        setTimeout(() => {
          setAutoFilledFields({ ...EMPTY_FLAGS });
        }, AUTO_FILL_CLEAR_DELAY);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previousExpense, expenseName]);

  const markUserModified = useCallback((field) => {
    setUserModifiedFields((prev) => ({ ...prev, [field]: true }));
    setAutoFilledFields((prev) => ({ ...prev, [field]: false }));
  }, []);

  return { autoFilledFields, userModifiedFields, markUserModified };
}
