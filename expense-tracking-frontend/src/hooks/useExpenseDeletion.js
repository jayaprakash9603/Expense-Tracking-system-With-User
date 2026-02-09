import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  deleteExpenseAction,
  getExpenseAction,
  deleteMultiExpenses,
} from "../Redux/Expenses/expense.action";
import { deleteBill, getBillByExpenseId } from "../Redux/Bill/bill.action";
import { fetchCashflowExpenses } from "../Redux/Expenses/expense.action";

// Handles single & multi deletion flow, toast messaging, and reset
export default function useExpenseDeletion({
  activeRange,
  offset,
  flowTab,
  isFriendView,
  friendId,
  setSelectedCardIdx,
  setSelectedBar,
  setSelectedBars,
}) {
  const dispatch = useDispatch();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [expenseData, setExpenseData] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const openMultiDelete = (ids, count) => {
    setExpenseData({});
    setExpenseToDelete(ids);
    setConfirmationText(
      `Are you sure you want to delete ${count} selected expenses?`
    );
    setIsDeleteModalOpen(true);
  };

  const openSingleDelete = (row) => {
    setExpenseData({
      name: row.name,
      amount: row.amount,
      type: row.type || row.expense?.type,
      paymentMethod: row.paymentMethod || row.expense?.paymentMethod,
      netAmount: row.netAmount || row.expense?.netAmount,
      comments: row.comments,
      creditDue: row.creditDue || row.expense?.creditDue,
      date: row.date || row.expense?.date,
    });
    setExpenseToDelete(row.id || row.expenseId);
    setConfirmationText(
      `Are you sure you want to delete "${
        row.name || row.expense?.expenseName || "this expense"
      }"?`
    );
    setIsDeleteModalOpen(true);
  };

  const handleToastClose = () => {
    setToastOpen(false);
    setToastMessage("");
  };
  const showToast = (message) => {
    setToastMessage(message);
    setToastOpen(true);
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setExpenseToDelete(null);
    setExpenseData({});
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;
    setIsDeleting(true);
    if (Array.isArray(expenseToDelete)) {
      try {
        await dispatch(
          deleteMultiExpenses(
            expenseToDelete,
            isFriendView ? friendId : undefined
          )
        );
        dispatch(
          fetchCashflowExpenses({
            range: activeRange,
            offset,
            flowType: flowTab === "all" ? null : flowTab,
            targetId: isFriendView ? friendId : undefined,
            groupBy: false,
          })
        );
        setToastMessage("Selected expenses deleted successfully.");
        setToastOpen(true);
      } catch (err) {
        setToastMessage("Error deleting selected expenses. Please try again.");
        setToastOpen(true);
      } finally {
        setIsDeleting(false);
        setIsDeleteModalOpen(false);
        setExpenseToDelete(null);
        setExpenseData({});
        setSelectedCardIdx([]);
        setSelectedBar(null);
        setSelectedBars([]);
      }
      return;
    }
    try {
      const expensedata = await dispatch(
        getExpenseAction(expenseToDelete, friendId || "")
      );
      const bill = expensedata.bill
        ? await dispatch(getBillByExpenseId(expenseToDelete, friendId || ""))
        : false;
      await dispatch(
        bill
          ? deleteBill(bill.id, friendId || "")
          : deleteExpenseAction(expenseToDelete, friendId || "")
      );
      dispatch(
        fetchCashflowExpenses({
          range: activeRange,
          offset,
          flowType: flowTab === "all" ? null : flowTab,
          targetId: isFriendView ? friendId : undefined,
          groupBy: false,
        })
      );
      setToastMessage(
        bill ? "Bill deleted successfully" : "Expense deleted successfully."
      );
      setToastOpen(true);
    } catch {
      setToastMessage("Error deleting expense. Please try again.");
      setToastOpen(true);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setExpenseToDelete(null);
      setExpenseData({});
      setSelectedCardIdx([]);
      setSelectedBar(null);
      setSelectedBars([]);
    }
  };

  return {
    // state
    isDeleteModalOpen,
    expenseData,
    expenseToDelete,
    isDeleting,
    confirmationText,
    toastOpen,
    toastMessage,
    // actions
    openMultiDelete,
    openSingleDelete,
    cancelDelete,
    confirmDelete,
    handleToastClose,
    showToast,
  };
}
