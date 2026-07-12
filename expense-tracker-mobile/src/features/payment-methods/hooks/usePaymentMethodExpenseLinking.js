import { useCallback, useEffect, useMemo, useState } from "react";
import { expenseApi } from "@/infrastructure/api";
import { buildExpenseUpdatePayloadForPaymentMethod } from "@/domain/expenses/expensePaymentMethodLinkPayload";
import { normalizeExpenseRowsForLinkTable } from "@/domain/expenses/expenseSelectionRows";
import { normalizePaymentMethod } from "@/domain/shared/paymentMethod.utils";

const EXPENSE_LIST_PAGE_SIZE = 200;

export function usePaymentMethodExpenseLinking({ mode, paymentMethodName }) {
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
    if (mode === "edit" && paymentMethodName) {
      const targetMethod = normalizePaymentMethod(paymentMethodName);
      const pre = normalized
        .filter((row) => normalizePaymentMethod(row.paymentMethod) === targetMethod)
        .map((row) => row.id);
      setSelectedExpenseIds(pre);
      setInitialSelection(pre);
    } else {
      setSelectedExpenseIds([]);
      setInitialSelection([]);
    }
  }, [mode, paymentMethodName]);

  useEffect(() => {
    if (!showTable) return;
    fetchExpenseList();
  }, [showTable, fetchExpenseList]);

  const selectionDirty = useMemo(() => {
    const a = [...initialSelection].map(String).sort().join(",");
    const b = [...selectedExpenseIds].map(String).sort().join(",");
    return a !== b;
  }, [initialSelection, selectedExpenseIds]);

  const applyPaymentMethodToSelectedExpenses = useCallback(async (resolvedPaymentMethodName) => {
    if (!resolvedPaymentMethodName || selectedExpenseIds.length === 0) {
      return { success: true };
    }
    const target = String(resolvedPaymentMethodName);
    const updates = await Promise.all(
      selectedExpenseIds.map(async (expId) => {
        const { data, error } = await expenseApi.getById(expId);
        if (error || !data) {
          return { ok: false, error: error?.message || "fetch" };
        }
        const payload = buildExpenseUpdatePayloadForPaymentMethod(data, target);
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
    applyPaymentMethodToSelectedExpenses,
  };
}
