import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  EMPTY_BILL_EXPENSE_ROW,
  filterValidBillExpenses,
  computeBillExpensesTotal,
  isBillExpenseRowComplete,
} from "@/domain/bills/billExpenseLineUtils";

function cloneRows(rows) {
  return rows.map((r) => ({ ...r, unitPrice: String(r.unitPrice ?? "") }));
}

export function useBillExpenseItems({
  t,
  committedExpenses,
  onCommit,
  onBeforeOpenExpense,
}) {
  const lastRowRef = useRef(null);
  const [tempExpenses, setTempExpenses] = useState([{ ...EMPTY_BILL_EXPENSE_ROW }]);
  const [showExpenseTable, setShowExpenseTable] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  const handleTempChange = useCallback((index, field, value) => {
    setTempExpenses((prev) => {
      const next = [...prev];
      const row = { ...next[index], [field]: value };
      if (field === "quantity" || field === "unitPrice") {
        const qty = parseFloat(row.quantity) || 0;
        const price = parseFloat(row.unitPrice) || 0;
        row.totalPrice = qty * price;
      }
      next[index] = row;
      return next;
    });
    setHasUnsaved(true);
  }, []);

  const addRow = useCallback(() => {
    setTempExpenses((prev) => {
      if (!isBillExpenseRowComplete(prev[prev.length - 1])) return prev;
      const next = [...prev, { ...EMPTY_BILL_EXPENSE_ROW }];
      setTimeout(() => {
        lastRowRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 80);
      return next;
    });
    setHasUnsaved(true);
  }, []);

  const removeRow = useCallback((index) => {
    setTempExpenses((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
    setHasUnsaved(true);
  }, []);

  const handleSave = useCallback(() => {
    const valid = filterValidBillExpenses(tempExpenses);
    if (valid.length === 0) {
      toast.error(t("billForm.messages.addLineItems"));
      return;
    }
    onCommit?.(valid);
    setShowExpenseTable(false);
    setHasUnsaved(false);
    setTempExpenses([{ ...EMPTY_BILL_EXPENSE_ROW }]);
  }, [tempExpenses, onCommit, t]);

  const openTable = useCallback(() => {
    onBeforeOpenExpense?.();
    setShowExpenseTable(true);
    if (committedExpenses?.length) {
      setTempExpenses(cloneRows(committedExpenses));
      setHasUnsaved(false);
    } else {
      setTempExpenses([{ ...EMPTY_BILL_EXPENSE_ROW }]);
    }
  }, [committedExpenses, onBeforeOpenExpense]);

  const closeTable = useCallback(() => {
    if (hasUnsaved) {
      toast.message(t("billForm.messages.discardLineEdits"));
    }
    setShowExpenseTable(false);
    setTempExpenses([{ ...EMPTY_BILL_EXPENSE_ROW }]);
    setHasUnsaved(false);
  }, [hasUnsaved, t]);

  const toggleTable = useCallback(() => {
    if (showExpenseTable) {
      closeTable();
    } else {
      openTable();
    }
  }, [showExpenseTable, closeTable, openTable]);

  return {
    tempExpenses,
    showExpenseTable,
    lastRowRef,
    handleTempChange,
    addRow,
    removeRow,
    handleSave,
    openTable,
    closeTable,
    toggleTable,
    setShowExpenseTable,
  };
}

export default useBillExpenseItems;
