import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { budgetApi, expenseApi } from "@/infrastructure/api";
import { getToday } from "@/shared/utils/format/dateUtils";
import { BUDGET_DEFAULTS } from "@/domain/budgets/budget.model";
import { validateBudget } from "@/domain/budgets/budget.validators";
import { fromApiResponse, toApiPayload } from "@/domain/budgets/budget.transformers";
import { extractExpenseDetails } from "@/domain/expenses/expense.utils";
import { normalizeApiListOrObjectArrays } from "@/shared/utils/api/normalizeApiList";

function normalizeExpenseRows(data) {
  const base = normalizeApiListOrObjectArrays(data, "content", "expenses");

  return base
    .map((row) => {
      const details = extractExpenseDetails(row);
      const id = details?.id ?? row?.id;
      if (!id) return null;
      return {
        id,
        expenseName: details?.expenseName || details?.name || row?.expenseName || row?.name || "",
        date: details?.date || row?.date || "",
        amount: details?.amount ?? row?.amount ?? 0,
        type: details?.type || row?.type || "",
        categoryName:
          row?.categoryName || details?.categoryName || row?.category || details?.category || "",
        includeInBudget:
          typeof row?.includeInBudget === "boolean"
            ? row.includeInBudget
            : typeof details?.includeInBudget === "boolean"
              ? details.includeInBudget
              : undefined,
      };
    })
    .filter(Boolean);
}

function buildInitialErrors() {
  return {
    name: "",
    description: "",
    amount: "",
    startDate: "",
    endDate: "",
  };
}

export function useBudgetForm({
  mode = "create",
  entityId = null,
  friendId = "",
  onSuccess,
  onError,
} = {}) {
  const isEditMode = mode === "edit";
  const [formData, setFormData] = useState(() => ({
    ...BUDGET_DEFAULTS,
    startDate: BUDGET_DEFAULTS.startDate || getToday(),
  }));
  const [errors, setErrors] = useState(buildInitialErrors);
  const [isLoading, setIsLoading] = useState(Boolean(isEditMode));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showTable, setShowTable] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState([]);
  const [expenseError, setExpenseError] = useState("");
  const [expensesLoading, setExpensesLoading] = useState(() => !isEditMode);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const clearFieldError = useCallback((field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      return { ...prev, [field]: "" };
    });
  }, []);

  const setFieldValue = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      clearFieldError(field);
      setIsDirty(true);
    },
    [clearFieldError],
  );

  const handleChange = useCallback(
    (field, value) => {
      setFieldValue(field, value);
    },
    [setFieldValue],
  );

  const validate = useCallback(() => {
    const result = validateBudget(formData);
    if (!result.valid) {
      setErrors((prev) => ({ ...prev, ...buildInitialErrors(), ...result.errors }));
      return false;
    }
    setErrors(buildInitialErrors());
    return true;
  }, [formData]);

  const applyExpenseSelectionFromRows = useCallback((rows) => {
    const hasIncludeFlags = rows.some((row) => typeof row.includeInBudget === "boolean");
    const selected = hasIncludeFlags
      ? rows.filter((row) => row.includeInBudget).map((row) => row.id)
      : rows.map((row) => row.id);
    setSelectedExpenseIds(selected);
  }, []);

  const fetchExpensesForBudget = useCallback(
    async (budgetId) => {
      if (!budgetId) return;
      setExpensesLoading(true);
      setExpenseError("");
      const { data, error } = await budgetApi.getExpenses(budgetId, {
        targetId: friendId || "",
      });
      setExpensesLoading(false);
      if (error) {
        setExpenses([]);
        setSelectedExpenseIds([]);
        setExpenseError(error.message || "Failed to fetch linked expenses");
        return;
      }
      const normalized = normalizeExpenseRows(data);
      setExpenses(normalized);
      applyExpenseSelectionFromRows(normalized);
    },
    [friendId, applyExpenseSelectionFromRows],
  );

  const fetchExpensesForDateRange = useCallback(
    async (startDate, endDate) => {
      if (!startDate) return;
      const effectiveEndDate = endDate || startDate;
      setExpensesLoading(true);
      setExpenseError("");

      const { data, error } = await expenseApi.getAll({
        startDate,
        endDate: effectiveEndDate,
        sort: "desc",
        targetId: friendId || "",
      });

      setExpensesLoading(false);
      if (error) {
        setExpenses([]);
        setSelectedExpenseIds([]);
        setExpenseError(error.message || "Failed to fetch expenses");
        return;
      }
      const normalized = normalizeExpenseRows(data);
      setExpenses(normalized);
      setSelectedExpenseIds([]);
    },
    [friendId],
  );

  useEffect(() => {
    if (!isEditMode || !entityId) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);

    const run = async () => {
      const { data, error } = await budgetApi.getById(entityId, friendId || "");
      if (cancelled) return;
      if (error) {
        onErrorRef.current?.(error);
        setIsLoading(false);
        return;
      }
      const parsed = fromApiResponse(data);
      setFormData((prev) => ({
        ...prev,
        ...parsed,
        amount: parsed.amount != null ? String(parsed.amount) : "",
      }));
      setIsLoading(false);
      await fetchExpensesForBudget(entityId);
    };

    run();

    return () => {
      cancelled = true;
      setIsLoading(false);
    };
  }, [isEditMode, entityId, friendId, fetchExpensesForBudget]);

  useEffect(() => {
    if (isEditMode || !showTable) return;
    fetchExpensesForDateRange(formData.startDate, formData.endDate);
  }, [isEditMode, showTable, formData.startDate, formData.endDate, fetchExpensesForDateRange]);

  const refreshLinkedExpenses = useCallback(
    async (startDateOverride, endDateOverride) => {
      if (isEditMode && entityId) {
        await fetchExpensesForBudget(entityId);
        return;
      }
      await fetchExpensesForDateRange(
        startDateOverride || formData.startDate,
        endDateOverride || formData.endDate,
      );
    },
    [
      isEditMode,
      entityId,
      formData.startDate,
      formData.endDate,
      fetchExpensesForBudget,
      fetchExpensesForDateRange,
    ],
  );

  const handleSubmit = useCallback(async () => {
    if (!validate()) return { success: false };

    setIsSubmitting(true);
    const payload = {
      ...toApiPayload(formData),
      expenseIds: selectedExpenseIds,
    };

    const response = isEditMode
      ? await budgetApi.update(entityId, payload, friendId || "")
      : await budgetApi.create(payload, friendId || "");

    setIsSubmitting(false);
    if (response.error) {
      onErrorRef.current?.(response.error);
      return { success: false, error: response.error };
    }

    setIsDirty(false);
    onSuccess?.(response.data);
    return { success: true, data: response.data };
  }, [validate, formData, selectedExpenseIds, isEditMode, entityId, friendId, onSuccess]);

  return {
    formData,
    errors,
    isLoading,
    isSubmitting,
    isDirty,
    showTable,
    expenses,
    expenseError,
    expensesLoading,
    selectedExpenseIds,
    setSelectedExpenseIds,
    setShowTable,
    setFieldValue,
    clearFieldError,
    handleChange,
    handleSubmit,
    refreshLinkedExpenses,
  };
}

export default useBudgetForm;
