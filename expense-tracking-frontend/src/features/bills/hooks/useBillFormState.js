import { useState, useEffect, useCallback } from "react";
import { getListOfBudgetsById } from "../../../Redux/Budget/budget.action";
import { computeTotalAmount } from "../utils/billFormUtils";

export default function useBillFormState({
  isCreateMode,
  isEditMode,
  dateFromQuery,
  dispatch,
  friendId,
}) {
  const today = new Date().toISOString().split("T")[0];

  const [billData, setBillData] = useState({
    name: "",
    description: "",
    amount: "",
    paymentMethod: "cash",
    type: "loss",
    date: isCreateMode ? (dateFromQuery || today) : "",
    categoryId: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isCreateMode) {
      dispatch(getListOfBudgetsById(today, friendId || ""));
    }
  }, [isCreateMode, dispatch, today, friendId]);

  useEffect(() => {
    if (isEditMode && billData.date) {
      dispatch(getListOfBudgetsById(billData.date, friendId || ""));
    }
  }, [isEditMode, dispatch, billData.date, friendId]);

  const syncAmountFromExpenses = useCallback((expenses) => {
    const totalAmount = computeTotalAmount(expenses);
    setBillData((prev) => {
      if (prev.amount === totalAmount.toString()) return prev;
      return { ...prev, amount: totalAmount.toString() };
    });
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setBillData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: false } : prev));
  }, []);

  const handleTypeChange = useCallback((event, newValue) => {
    const newType = newValue || "loss";
    setBillData((prev) => ({ ...prev, type: newType }));
    setErrors((prev) => (prev.type ? { ...prev, type: false } : prev));
  }, []);

  const handleDateChange = useCallback(
    (formatted) => {
      if (formatted) {
        setBillData((prev) => ({ ...prev, date: formatted }));
        dispatch(getListOfBudgetsById(formatted, friendId || ""));
      }
      setErrors((prev) => (prev.date ? { ...prev, date: false } : prev));
    },
    [dispatch, friendId],
  );

  const clearFieldError = useCallback((field) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: false } : prev));
  }, []);

  const resetFormData = useCallback((overrides = {}) => {
    setBillData({
      name: "",
      description: "",
      amount: "",
      paymentMethod: "cash",
      type: "loss",
      date: overrides.date || new Date().toISOString().split("T")[0],
      categoryId: "",
      ...overrides,
    });
    setErrors({});
  }, []);

  return {
    billData,
    setBillData,
    errors,
    setErrors,
    handleInputChange,
    handleTypeChange,
    handleDateChange,
    clearFieldError,
    resetFormData,
    syncAmountFromExpenses,
    today,
  };
}
