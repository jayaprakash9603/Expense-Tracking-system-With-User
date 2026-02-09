import React, { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import useFriendAccess from "../../hooks/useFriendAccess";
import DayUnifiedView from "../../components/DayUnifiedView/DayUnifiedView";
import {
  getExpensesByParticularDate,
  deleteExpenseAction,
} from "../../Redux/Expenses/expense.action";

const DayTransactionsView = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { date, friendId } = useParams();
  const { hasWriteAccess } = useFriendAccess(friendId);
  const { particularDateExpenses = [], loading } = useSelector(
    (state) => state.expenses
  );

  const fetchExpenses = useCallback(
    (d, f) => dispatch(getExpensesByParticularDate(d, f)),
    [dispatch]
  );
  const deleteExpense = useCallback(
    (id, f) => dispatch(deleteExpenseAction(id, f)),
    [dispatch]
  );
  const refetchAfterDelete = useCallback(
    (d, f) => dispatch(getExpensesByParticularDate(d, f)),
    [dispatch]
  );

  return (
    <DayUnifiedView
      type="expense"
      dateParam={date}
      friendId={friendId}
      hasWriteAccess={hasWriteAccess}
      loading={loading}
      items={particularDateExpenses}
      fetchAction={fetchExpenses}
      deleteAction={deleteExpense}
      fetchAfterDelete={refetchAfterDelete}
      navigate={navigate}
      routes={{
        calendarBase: "/calendar-view",
        dayBase: "/day-view",
        editBase: "/expenses/edit",
        createBase: "/expenses/create",
      }}
      getEditTargetId={(item) => item.id || item.expense?.id || item.expenseId}
      getDeleteTargetId={(item) =>
        item.id || item.expense?.id || item.expenseId
      }
      emptyTitle="No transactions!"
    />
  );
};

export default DayTransactionsView;
