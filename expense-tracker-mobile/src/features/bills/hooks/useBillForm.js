import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { getToday } from "@/shared/utils/format/dateUtils";
import { budgetApi } from "@/infrastructure/api";
import { normalizeApiList } from "@/shared/utils/api/normalizeApiList";
import { buildBillApiPayload } from "@/domain/bills/billPayload";
import { validateBillForm } from "@/domain/bills/bill.validators";
import {
  computeBillExpensesTotal,
  filterValidBillExpenses,
} from "@/domain/bills/billExpenseLineUtils";
import { fromApiResponse } from "@/domain/bills/bill.transformers";
import {
  createBillAction,
  fetchBillByIdAction,
  updateBillAction,
} from "@/redux/bills/bills.actions";
import { useFormFields, useEditLoader, useSyncedRef } from "@/shared/hooks/form/useFormState";
import { usePreviousExpense } from "@/features/expenses/hooks/usePreviousExpense";
import { useBillAutoFill } from "./useBillAutoFill";
import { buildEmptyBillFormData, createEmptyBillFormErrors } from "./billFormState";

export function useBillForm({
  mode = "create",
  entityId = null,
  friendId = "",
  dateFromQuery = "",
  onSuccess,
  onError,
} = {}) {
  const dispatch = useDispatch();
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
    getInitialForm: () => buildEmptyBillFormData(initialDate),
    getInitialErrors: createEmptyBillFormErrors,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [budgetsLoading, setBudgetsLoading] = useState(() => isCreateMode);
  const onErrorRef = useSyncedRef(onError);

  const { previousExpense, loadingPreviousExpense } = usePreviousExpense(
    isCreateMode ? formData.name : null,
    isCreateMode ? formData.date : null,
    friendId,
  );

  const { autoFilledFields, markUserModified } = useBillAutoFill(
    isCreateMode ? previousExpense : null,
    isCreateMode ? formData.name : null,
    formData,
    setFormData,
  );

  const fetchBudgetsByDate = useCallback(
    async (dateValue) => {
      if (!dateValue) {
        setBudgets([]);
        return;
      }
      setBudgetsLoading(true);
      const { data, error } = await budgetApi.filterByDate({
        date: dateValue,
        targetId: friendId || "",
      });
      setBudgetsLoading(false);
      if (error) {
        setBudgets([]);
        onErrorRef.current?.(error);
        return;
      }
      setBudgets(normalizeApiList(data, "content", "budgets"));
    },
    [friendId, onErrorRef],
  );

  useEffect(() => {
    if (!isCreateMode) return;
    fetchBudgetsByDate(initialDate);
  }, [isCreateMode, initialDate, fetchBudgetsByDate]);

  useEffect(() => {
    if (!isCreateMode || !dateFromQuery) return;
    setFormData((prev) => ({ ...prev, date: dateFromQuery }));
  }, [isCreateMode, dateFromQuery, setFormData]);

  useEffect(() => {
    setFormData((prev) => {
      const valid = filterValidBillExpenses(prev.expenses || []);
      const total = computeBillExpensesTotal(valid);
      const nextAmount = total > 0 ? String(total) : "";
      if (prev.amount === nextAmount) return prev;
      return { ...prev, amount: nextAmount };
    });
  }, [formData.expenses, setFormData]);

  const loadBillForEdit = useCallback(
    async ({ cancelled, setIsLoading }) => {
      const result = await dispatch(fetchBillByIdAction(entityId));
      if (cancelled()) return;
      if (!result?.success || !result.data) {
        onErrorRef.current?.(result?.error);
        setIsLoading(false);
        return;
      }
      const mapped = fromApiResponse(result.data, today);
      setFormData(mapped);
      setIsLoading(false);
      await fetchBudgetsByDate(mapped.date);
    },
    [dispatch, entityId, today, setFormData, fetchBudgetsByDate, onErrorRef],
  );

  const isLoading = useEditLoader(isEditMode && Boolean(entityId), loadBillForEdit, entityId);

  const handleChange = useCallback(
    (field, value) => {
      setFieldValue(field, value);
      clearFieldError(field);
    },
    [setFieldValue, clearFieldError],
  );

  const setFieldValues = useCallback(
    (values) => {
      setFormData((prev) => ({ ...prev, ...values }));
    },
    [setFormData],
  );

  const handleDateChange = useCallback(
    async (nextDate) => {
      const next = nextDate || today;
      setFormData((prev) => ({ ...prev, date: next }));
      clearFieldError("date");
      await fetchBudgetsByDate(next);
    },
    [today, setFormData, clearFieldError, fetchBudgetsByDate],
  );

  const validate = useCallback(() => {
    const result = validateBillForm(formData);
    if (!result.valid) {
      setErrors({ ...createEmptyBillFormErrors(), ...result.errors });
      return false;
    }
    setErrors(createEmptyBillFormErrors());
    return true;
  }, [formData, setErrors]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return { success: false };
    setIsSubmitting(true);
    const payload = buildBillApiPayload(formData, isEditMode ? entityId : null);
    const result = isEditMode
      ? await dispatch(updateBillAction(entityId, payload))
      : await dispatch(createBillAction(payload));
    setIsSubmitting(false);
    if (!result?.success) {
      onError?.(result?.error);
      return { success: false, error: result?.error };
    }
    onSuccess?.(result.data);
    return { success: true, data: result.data };
  }, [
    validate,
    formData,
    isEditMode,
    entityId,
    dispatch,
    onSuccess,
    onError,
  ]);

  return {
    formData,
    errors,
    handleChange,
    setFieldValues,
    handleDateChange,
    clearFieldError,
    setFieldValue,
    isLoading,
    isSubmitting,
    handleSubmit,
    budgets,
    budgetsLoading,
    previousExpense,
    loadingPreviousExpense,
    autoFilledFields,
    markUserModified,
    isCreateMode,
  };
}

export default useBillForm;
