import { useState, useEffect, useCallback, useMemo } from "react";
import { budgetApi, expenseApi } from "@/infrastructure/api";
import { getToday } from "@/shared/utils/format/dateUtils";
import { normalizePaymentMethod } from "../utils/expensePaymentMethodUtils";
import { usePreviousExpense } from "./usePreviousExpense";
import { useExpenseAutoFill } from "./useExpenseAutoFill";
import { EXPENSE_FORM_VALIDATION_MESSAGES } from "@/features/expenses/config/expenseConfig";
import { normalizeApiList } from "@/shared/utils/api/normalizeApiList";
import { useFormFields, useEditLoader, useSyncedRef } from "@/shared/hooks/form/useFormState";
import {
  buildEmptyExpenseFormData,
  computeSalaryType,
  createEmptyExpenseFormErrors,
  mapExpenseToFormData,
  normalizeExpenseTransactionType,
} from "./expenseFormState";

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

  const {
    formData,
    setFormData,
    errors,
    setErrors,
    setFieldValue,
    clearFieldError,
  } = useFormFields({
    getInitialForm: () => buildEmptyExpenseFormData(initialDate),
    getInitialErrors: createEmptyExpenseFormErrors,
    trackDirty: false,
    clearErrorOnChange: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTable, setShowTable] = useState(true);
  const [budgets, setBudgets] = useState([]);
  const [budgetsLoading, setBudgetsLoading] = useState(() => isCreateMode);
  const [budgetError, setBudgetError] = useState(null);
  const [selectedBudgetIds, setSelectedBudgetIds] = useState([]);
  const onErrorRef = useSyncedRef(onError);

  const { previousExpense, loadingPreviousExpense } = usePreviousExpense(
    isCreateMode ? formData.expenseName : null,
    isCreateMode ? formData.date : null,
    isCreateMode ? friendId : null,
  );

  const { autoFilledFields, markUserModified, autoFillNoticeToken } = useExpenseAutoFill(
    isCreateMode ? previousExpense : null,
    isCreateMode ? formData.expenseName : null,
    formData,
    setFormData,
  );

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

  const loadExpenseForEdit = useCallback(
    async ({ cancelled, setIsLoading }) => {
      const { data, error } = await expenseApi.getById(entityId, friendId);
      if (cancelled()) return;
      if (error) {
        onErrorRef.current?.(error);
        setIsLoading(false);
        return;
      }
      const parsed = mapExpenseToFormData(data, today);
      setFormData((prev) => ({ ...prev, ...parsed }));
      setIsLoading(false);
      await fetchBudgetsByExpenseId(entityId, parsed.date || today);
    },
    [entityId, friendId, today, fetchBudgetsByExpenseId, onErrorRef, setFormData],
  );

  const isLoading = useEditLoader(
    isEditMode && Boolean(entityId),
    loadExpenseForEdit,
    entityId,
    friendId,
    today,
    fetchBudgetsByExpenseId,
  );

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
    const nextErrors = createEmptyExpenseFormErrors();
    const msg = EXPENSE_FORM_VALIDATION_MESSAGES;
    if (!String(formData.expenseName || "").trim()) {
      nextErrors.expenseName = msg.expenseName;
    }
    const amount = Number(formData.amount);
    if (!formData.amount || !Number.isFinite(amount) || amount <= 0) {
      nextErrors.amount = msg.amount;
    }
    if (!formData.date) {
      nextErrors.date = msg.date;
    }
    if (!formData.transactionType) {
      nextErrors.transactionType = msg.transactionType;
    }
    setErrors(nextErrors);
    return Object.values(nextErrors).every((value) => !value);
  }, [formData, setErrors]);

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
        type: normalizeExpenseTransactionType(formData.transactionType),
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
    autoFillNoticeToken,
    handleDateChange,
    handleSubmit,
  };
}

export default useExpenseForm;
