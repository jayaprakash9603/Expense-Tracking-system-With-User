import { useState, useRef, useCallback } from "react";
import BillExpenseTable from "../components/BillExpenseTable";
import { EMPTY_TEMP_ROW } from "../utils/billFormUtils";

const CREATE_INITIAL_ROW = { itemName: "", quantity: 1, unitPrice: "", totalPrice: 0 };

export default function useBillExpenseItems({ isCreateMode, t }) {
  const lastRowRef = useRef(null);
  const [expenses, setExpenses] = useState([]);
  const [tempExpenses, setTempExpenses] = useState([
    isCreateMode ? { ...CREATE_INITIAL_ROW } : { ...EMPTY_TEMP_ROW },
  ]);
  const [hasUnsavedExpenseChanges, setHasUnsavedExpenseChanges] = useState(false);
  const [showExpenseTable, setShowExpenseTable] = useState(false);
  const [showBudgetTable, setShowBudgetTable] = useState(false);

  const handleTempExpenseChange = useCallback((index, field, value) => {
    setTempExpenses((prev) => {
      const updated = [...prev];
      if (field === "quantity" || field === "unitPrice") {
        const numValue = parseFloat(value);
        if (value !== "" && !(numValue > 0)) return prev;
        updated[index] = { ...updated[index], [field]: value };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      if (field === "quantity" || field === "unitPrice") {
        const qty = parseFloat(updated[index].quantity) || 0;
        const price = parseFloat(updated[index].unitPrice) || 0;
        updated[index] = { ...updated[index], totalPrice: qty * price };
      }
      return updated;
    });
    setHasUnsavedExpenseChanges(true);
  }, []);

  const handleItemNameChange = useCallback((index, event, newValue) => {
    setTempExpenses((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], itemName: newValue || "" };
      const qty = parseFloat(item.quantity) || 1;
      const price = parseFloat(item.unitPrice) || 0;
      item.totalPrice = qty * price;
      updated[index] = item;
      return updated;
    });
    setHasUnsavedExpenseChanges(true);
    setTimeout(() => setTempExpenses((prev) => [...prev]), 0);
  }, []);

  const addTempExpenseRow = useCallback(() => {
    setTempExpenses((prev) => {
      if (!BillExpenseTable.isRowComplete(prev[prev.length - 1])) return prev;
      const next = [...prev, { ...EMPTY_TEMP_ROW }];
      setTimeout(() => {
        if (lastRowRef.current) {
          lastRowRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
          const input = lastRowRef.current.querySelector("input");
          if (input) input.focus();
        }
      }, 100);
      return next;
    });
    setHasUnsavedExpenseChanges(true);
  }, []);

  const removeTempExpenseRow = useCallback((index) => {
    setTempExpenses((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
    setHasUnsavedExpenseChanges(true);
  }, []);

  const hasValidExpenseEntries = useCallback(() => {
    return tempExpenses.some(
      (exp) =>
        exp.itemName.trim() !== "" ||
        (exp.unitPrice !== "" &&
          !isNaN(parseFloat(exp.unitPrice)) &&
          parseFloat(exp.unitPrice) > 0) ||
        (exp.quantity !== "" &&
          !isNaN(parseFloat(exp.quantity)) &&
          parseFloat(exp.quantity) > 0),
    );
  }, [tempExpenses]);

  const handleSaveExpenses = useCallback(() => {
    const valid = tempExpenses.filter((exp) => BillExpenseTable.isRowComplete(exp));
    if (valid.length === 0) {
      alert(
        t(
          isCreateMode
            ? "billCommon.messages.addExpenseValidationDetailed"
            : "billCommon.messages.addExpenseValidationSimple",
        ),
      );
      return;
    }
    setExpenses(valid);
    setShowExpenseTable(false);
    setHasUnsavedExpenseChanges(false);
    setTempExpenses([{ ...EMPTY_TEMP_ROW }]);
  }, [tempExpenses, t, isCreateMode]);

  const handleOpenExpenseTable = useCallback(() => {
    if (showExpenseTable) {
      handleCloseExpenseTableWithConfirmation();
    } else {
      setShowExpenseTable(true);
      setShowBudgetTable(false);
      if (expenses.length > 0) {
        setTempExpenses([...expenses]);
        setHasUnsavedExpenseChanges(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showExpenseTable, expenses]);

  const handleCloseExpenseTableWithConfirmation = useCallback(() => {
    if (hasUnsavedExpenseChanges && hasValidExpenseEntries()) {
      const confirmClose = window.confirm(t("billCommon.messages.unsavedChanges"));
      if (confirmClose) {
        setTempExpenses([{ ...EMPTY_TEMP_ROW }]);
        setHasUnsavedExpenseChanges(false);
        setShowExpenseTable(false);
      }
    } else {
      if (isCreateMode && expenses.length > 0) {
        setTempExpenses([...expenses]);
      } else if (isCreateMode) {
        setTempExpenses([{ ...CREATE_INITIAL_ROW }]);
      }
      setShowExpenseTable(false);
    }
  }, [hasUnsavedExpenseChanges, hasValidExpenseEntries, t, isCreateMode, expenses]);

  const handleToggleBudgetTable = useCallback(() => {
    setShowBudgetTable((prev) => !prev);
    setShowExpenseTable(false);
  }, []);

  const handleCloseBudgetTable = useCallback(() => setShowBudgetTable(false), []);

  const resetExpenseState = useCallback(() => {
    setExpenses([]);
    setTempExpenses([{ ...CREATE_INITIAL_ROW }]);
    setHasUnsavedExpenseChanges(false);
    setShowExpenseTable(false);
    setShowBudgetTable(false);
  }, []);

  return {
    expenses,
    setExpenses,
    tempExpenses,
    showExpenseTable,
    showBudgetTable,
    lastRowRef,
    handleTempExpenseChange,
    handleItemNameChange,
    addTempExpenseRow,
    removeTempExpenseRow,
    handleSaveExpenses,
    handleOpenExpenseTable,
    handleCloseExpenseTableWithConfirmation,
    handleToggleBudgetTable,
    handleCloseBudgetTable,
    resetExpenseState,
  };
}
