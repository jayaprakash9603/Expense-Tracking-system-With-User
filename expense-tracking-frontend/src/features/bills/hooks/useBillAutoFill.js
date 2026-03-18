import { useState, useEffect, useCallback } from "react";

const EMPTY_FLAGS = {
  category: false,
  paymentMethod: false,
  type: false,
  description: false,
};

const AUTO_FILL_CLEAR_DELAY = 3000;

export default function useBillAutoFill(
  previousExpense,
  billName,
  billData,
  setBillData,
) {
  const [autoFilledFields, setAutoFilledFields] = useState({ ...EMPTY_FLAGS });
  const [lastAutoFilledName, setLastAutoFilledName] = useState("");
  const [userModifiedFields, setUserModifiedFields] = useState({ ...EMPTY_FLAGS });

  useEffect(() => {
    if (!billName || billName.trim().length < 2) {
      if (lastAutoFilledName) {
        setBillData((prev) => ({
          ...prev,
          categoryId: "",
          paymentMethod: "cash",
          type: "loss",
          description: "",
        }));
        setLastAutoFilledName("");
        setAutoFilledFields({ ...EMPTY_FLAGS });
        setUserModifiedFields({ ...EMPTY_FLAGS });
      }
      return;
    }

    if (previousExpense && billName?.trim().length >= 2) {
      const isNewName = billName.trim() !== lastAutoFilledName;
      const updates = {};
      const newAutoFilled = { ...autoFilledFields };

      if (
        previousExpense.categoryId &&
        (!billData.categoryId || (isNewName && !userModifiedFields.category))
      ) {
        updates.categoryId = previousExpense.categoryId;
        newAutoFilled.category = true;
      }

      if (
        previousExpense.expense?.paymentMethod &&
        (billData.paymentMethod === "cash" ||
          (isNewName && !userModifiedFields.paymentMethod))
      ) {
        updates.paymentMethod = previousExpense.expense.paymentMethod;
        newAutoFilled.paymentMethod = true;
      }

      if (
        previousExpense.expense?.type &&
        (billData.type === "loss" || (isNewName && !userModifiedFields.type))
      ) {
        updates.type = previousExpense.expense.type;
        newAutoFilled.type = true;
      }

      if (
        previousExpense.expense?.comments &&
        (!billData.description || (isNewName && !userModifiedFields.description))
      ) {
        updates.description = previousExpense.expense.comments;
        newAutoFilled.description = true;
      } else if (
        !previousExpense.expense?.comments &&
        isNewName &&
        !userModifiedFields.description
      ) {
        updates.description = "";
        newAutoFilled.description = false;
      }

      if (Object.keys(updates).length > 0) {
        setBillData((prev) => ({ ...prev, ...updates }));
        setAutoFilledFields(newAutoFilled);
        setLastAutoFilledName(billName.trim());

        if (isNewName) {
          setUserModifiedFields({ ...EMPTY_FLAGS });
        }

        setTimeout(() => {
          setAutoFilledFields({ ...EMPTY_FLAGS });
        }, AUTO_FILL_CLEAR_DELAY);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previousExpense, billName]);

  const markUserModified = useCallback((field) => {
    setUserModifiedFields((prev) => ({ ...prev, [field]: true }));
    setAutoFilledFields((prev) => ({ ...prev, [field]: false }));
  }, []);

  return { autoFilledFields, userModifiedFields, markUserModified };
}
