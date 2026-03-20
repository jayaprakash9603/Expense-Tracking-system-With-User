import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { budgetApi, expenseApi } from "@/infrastructure/api";
import {
  normalizeExpenseDateForForm,
  resolveExpenseFormCategoryFields,
} from "@/domain/expenses/expense.transformers";
import { extractExpenseDetails } from "@/domain/expenses/expense.utils";
import { getToday } from "@/shared/utils/format/dateUtils";
import { normalizePaymentMethod } from "../utils/expensePaymentMethodUtils";
import { usePreviousExpense } from "./usePreviousExpense";
import { useExpenseAutoFill } from "./useExpenseAutoFill";
import { normalizeApiList } from "@/shared/utils/api/normalizeApiList";

function computeSalaryType(dateValue) {
  if (!dateValue) return "loss";
  const currentDate = new Date(dateValue);
  if (Number.isNaN(currentDate.getTime())) return "loss";
  const lastDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  );
  const salaryDate = new Date(lastDay);
  if (salaryDate.getDay() === 6) salaryDate.setDate(salaryDate.getDate() - 1);
  if (salaryDate.getDay() === 0) salaryDate.setDate(salaryDate.getDate() - 2);
  return currentDate.toDateString() === salaryDate.toDateString() ? "gain" : "loss";
}

function normalizeType(typeValue) {
  const normalized = String(typeValue || "").toLowerCase();
  if (normalized === "gain" || normalized === "inflow" || normalized === "income") {
    return "gain";
  }
  return "loss";
}

function toFormData(rawExpense, fallbackDate) {
  const details = extractExpenseDetails(rawExpense);
  const resolvedAmount = details.amount ?? rawExpense.amount ?? "";
  const resolvedPaymentMethod = normalizePaymentMethod(
    details.paymentMethod ||
      rawExpense.paymentMethod ||
      rawExpense.paymentMethodInfo?.name ||
      "cash",
  );
  const { category, categoryName } = resolveExpenseFormCategoryFields(rawExpense, details);
  const resolvedDate = normalizeExpenseDateForForm(
    rawExpense.date ?? details.date,
    fallbackDate,
  );
  return {
    expenseName:
      details.expenseName ||
      details.name ||
      rawExpense.expenseName ||
      rawExpense.name ||
      "",
    amount: resolvedAmount === "" ? "" : String(resolvedAmount),
    netAmount:
      details.netAmount != null
        ? String(details.netAmount)
        : resolvedAmount === ""
          ? ""
          : String(resolvedAmount),
    paymentMethod: resolvedPaymentMethod,
    transactionType: normalizeType(details.type || rawExpense.type || "loss"),
    comments: details.comments || rawExpense.comments || "",
    date: resolvedDate,
    category,
    categoryName,
    creditDue:
      details.creditDue != null
        ? String(details.creditDue)
        : rawExpense.creditDue != null
          ? String(rawExpense.creditDue)
          : "",
  };
}

function getInitialErrors() {
  return {
    expenseName: "",
    amount: "",
    date: "",
    transactionType: "",
  };
}

function buildInitialFormData(initialDate) {
  return {
    expenseName: "",
    amount: "",
    netAmount: "",
    paymentMethod: "cash",
    transactionType: "loss",
    comments: "",
    date: initialDate,
    category: "",
    categoryName: "",
    creditDue: "",
  };
}

export function useExpenseForm({
  mode = "create",
  entityId = null,
  friendId = "",
  dateFromQuery = "",
  onSuccess,
  onError,
} = {}) {
  const today = useMemo(() => getToday(), []);
  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";
  const initialDate = dateFromQuery || today;

  const [formData, setFormData] = useState(() => buildInitialFormData(initialDate));
  const [errors, setErrors] = useState(getInitialErrors);
  const [isLoading, setIsLoading] = useState(Boolean(isEditMode));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTable, setShowTable] = useState(true);
  const [budgets, setBudgets] = useState([]);
  const [budgetsLoading, setBudgetsLoading] = useState(() => isCreateMode);
  const [budgetError, setBudgetError] = useState(null);
  const [selectedBudgetIds, setSelectedBudgetIds] = useState([]);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const { previousExpense, loadingPreviousExpense } = usePreviousExpense(
    isCreateMode ? formData.expenseName : null,
    isCreateMode ? formData.date : null,
    isCreateMode ? friendId : null,
  );

  const { autoFilledFields, markUserModified } = useExpenseAutoFill(
    isCreateMode ? previousExpense : null,
    isCreateMode ? formData.expenseName : null,
    formData,
    setFormData,
  );

  const setFieldValue = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const clearFieldError = useCallback((field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      return { ...prev, [field]: "" };
    });
  }, []);

  const handleInputChange = useCallback(
    (event) => {
      const { name, value } = event.target || {};
      if (!name) return;
      setFieldValue(name, value);
      clearFieldError(name);
    },
    [setFieldValue, clearFieldError],
  );

  const fetchBudgetsByDate = useCallback(
    async (dateValue) => {
      setBudgetsLoading(true);
      setBudgetError(null);
      const { data, error } = await budgetApi.filterByDate({
        date: dateValue,
        targetId: friendId || "",
      });
      setBudgetsLoading(false);
      if (error) {
        setBudgets([]);
        setSelectedBudgetIds([]);
        setBudgetError(error.message);
        return;
      }
      const normalized = normalizeApiList(data, "content", "budgets");
      setBudgets(normalized);
      setSelectedBudgetIds([]);
    },
    [friendId],
  );

  const fetchBudgetsByExpenseId = useCallback(
    async (expenseId, dateValue) => {
      setBudgetsLoading(true);
      setBudgetError(null);
      const { data, error } = await budgetApi.getByExpenseId({
        expenseId,
        date: dateValue,
        targetId: friendId || "",
      });
      setBudgetsLoading(false);
      if (error) {
        setBudgets([]);
        setSelectedBudgetIds([]);
        setBudgetError(error.message);
        return;
      }
      const normalized = normalizeApiList(data, "content", "budgets");
      setBudgets(normalized);
      setSelectedBudgetIds(
        normalized.filter((budget) => budget.includeInBudget).map((budget) => budget.id),
      );
    },
    [friendId],
  );

  useEffect(() => {
    if (!isCreateMode) return;
    fetchBudgetsByDate(initialDate);
  }, [isCreateMode, initialDate, fetchBudgetsByDate]);

  useEffect(() => {
    if (!isCreateMode || !dateFromQuery) return;
    setFormData((prev) => ({
      ...prev,
      date: dateFromQuery,
      transactionType: computeSalaryType(dateFromQuery),
    }));
  }, [isCreateMode, dateFromQuery]);

  useEffect(() => {
    if (!isEditMode || !entityId) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);

    const run = async () => {
      const { data, error } = await expenseApi.getById(entityId, friendId);
      if (cancelled) return;
      if (error) {
        onErrorRef.current?.(error);
        setIsLoading(false);
        return;
      }
      const parsed = toFormData(data, today);
      setFormData((prev) => ({ ...prev, ...parsed }));
      setIsLoading(false);
      await fetchBudgetsByExpenseId(entityId, parsed.date || today);
    };

    run();

    return () => {
      cancelled = true;
      setIsLoading(false);
    };
  }, [isEditMode, entityId, friendId, today, fetchBudgetsByExpenseId]);

  const handleDateChange = useCallback(
    async (formattedDate) => {
      const nextDate = formattedDate || today;
      setFormData((prev) => ({
        ...prev,
        date: nextDate,
        ...(isEditMode ? { transactionType: computeSalaryType(nextDate) } : {}),
      }));
      clearFieldError("date");

      if (isEditMode && entityId) {
        await fetchBudgetsByExpenseId(entityId, nextDate);
        return;
      }
      await fetchBudgetsByDate(nextDate);
    },
    [
      today,
      isEditMode,
      entityId,
      fetchBudgetsByDate,
      fetchBudgetsByExpenseId,
      clearFieldError,
    ],
  );

  const validate = useCallback(() => {
    const nextErrors = getInitialErrors();
    if (!String(formData.expenseName || "").trim()) {
      nextErrors.expenseName = "Expense name is required";
    }
    const amount = Number(formData.amount);
    if (!formData.amount || !Number.isFinite(amount) || amount <= 0) {
      nextErrors.amount = "Enter a valid amount";
    }
    if (!formData.date) {
      nextErrors.date = "Date is required";
    }
    if (!formData.transactionType) {
      nextErrors.transactionType = "Type is required";
    }
    setErrors(nextErrors);
    return Object.values(nextErrors).every((value) => !value);
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return { success: false };
    setIsSubmitting(true);
    const amount = Number(formData.amount) || 0;
    const normalizedPaymentMethod = normalizePaymentMethod(formData.paymentMethod);
    const payload = {
      date: formData.date,
      budgetIds: selectedBudgetIds,
      categoryId: formData.category || "",
      expense: {
        expenseName: String(formData.expenseName || "").trim(),
        amount,
        netAmount: amount,
        paymentMethod: normalizedPaymentMethod,
        type: normalizeType(formData.transactionType),
        comments: formData.comments || "",
        creditDue: normalizedPaymentMethod === "creditNeedToPaid" ? amount : 0,
      },
    };

    const request = isEditMode
      ? expenseApi.update(entityId, payload, friendId)
      : expenseApi.create(payload, friendId);

    const { data, error } = await request;
    setIsSubmitting(false);
    if (error) {
      onError?.(error);
      return { success: false, error };
    }
    onSuccess?.(data);
    return { success: true, data };
  }, [
    validate,
    formData,
    selectedBudgetIds,
    isEditMode,
    entityId,
    friendId,
    onSuccess,
    onError,
  ]);

  return {
    mode,
    isCreateMode,
    isEditMode,
    formData,
    setFormData,
    errors,
    setErrors,
    setFieldValue,
    handleInputChange,
    clearFieldError,
    isLoading,
    isSubmitting,
    showTable,
    setShowTable,
    budgets,
    budgetsLoading,
    budgetError,
    selectedBudgetIds,
    setSelectedBudgetIds,
    previousExpense,
    loadingPreviousExpense,
    autoFilledFields,
    markUserModified,
    handleDateChange,
    handleSubmit,
  };
}

export default useExpenseForm;
