import { useCallback, useEffect, useMemo, useState } from "react";
import { expenseApi } from "@/infrastructure/api";
import { buildExpenseUpdatePayloadFromDetailedRaw } from "@/domain/expenses/expenseCategoryLinkPayload";
import { normalizeExpenseRowsForLinkTable } from "@/domain/expenses/expenseSelectionRows";

const EXPENSE_LIST_PAGE_SIZE = 200;

export function useCategoryExpenseLinking({ mode, categoryId }) {
  const [showTable, setShowTable] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState([]);
  const [initialSelection, setInitialSelection] = useState([]);
  const [expenseError, setExpenseError] = useState("");
  const [expensesLoading, setExpensesLoading] = useState(false);

  const fetchExpenseList = useCallback(async () => {
    setExpensesLoading(true);
    setExpenseError("");
    const { data, error } = await expenseApi.getPaginated({
      page: 0,
      size: EXPENSE_LIST_PAGE_SIZE,
    });
    setExpensesLoading(false);
    if (error) {
      setExpenses([]);
      setSelectedExpenseIds([]);
      setInitialSelection([]);
      setExpenseError(error.message || "");
      return;
    }
    const normalized = normalizeExpenseRowsForLinkTable(data);
    setExpenses(normalized);
    if (mode === "edit" && categoryId) {
      const pre = normalized
        .filter((row) => String(row.categoryId ?? "") === String(categoryId))
        .map((row) => row.id);
      setSelectedExpenseIds(pre);
      setInitialSelection(pre);
    } else {
      setSelectedExpenseIds([]);
      setInitialSelection([]);
    }
  }, [mode, categoryId]);

  useEffect(() => {
    if (!showTable) return;
    fetchExpenseList();
  }, [showTable, fetchExpenseList]);

  const selectionDirty = useMemo(() => {
    const a = [...initialSelection].map(String).sort().join(",");
    const b = [...selectedExpenseIds].map(String).sort().join(",");
    return a !== b;
  }, [initialSelection, selectedExpenseIds]);

  const applyCategoryToSelectedExpenses = useCallback(async (resolvedCategoryId) => {
    if (!resolvedCategoryId || selectedExpenseIds.length === 0) {
      return { success: true };
    }
    const target = String(resolvedCategoryId);
    const updates = await Promise.all(
      selectedExpenseIds.map(async (expId) => {
        const { data, error } = await expenseApi.getById(expId);
        if (error || !data) {
          return { ok: false, error: error?.message || "fetch" };
        }
        const payload = buildExpenseUpdatePayloadFromDetailedRaw(data, target);
        const { error: updateError } = await expenseApi.update(expId, payload);
        if (updateError) {
          return { ok: false, error: updateError.message || "update" };
        }
        return { ok: true };
      }),
    );
    const failed = updates.find((u) => u.ok === false);
    if (failed) {
      return { success: false, error: failed.error };
    }
    return { success: true };
  }, [selectedExpenseIds]);

  return {
    showTable,
    setShowTable,
    expenses,
    expensesLoading,
    expenseError,
    selectedExpenseIds,
    setSelectedExpenseIds,
    selectionDirty,
    applyCategoryToSelectedExpenses,
  };
}
