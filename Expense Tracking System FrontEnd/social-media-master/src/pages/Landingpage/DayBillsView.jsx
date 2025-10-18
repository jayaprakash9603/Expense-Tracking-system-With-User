import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import DayUnifiedView from "../../components/DayUnifiedView/DayUnifiedView";
import useFriendAccess from "../../hooks/useFriendAccess";
import {
  getBillsByParticularDate,
  getBillByExpenseId,
  deleteBill,
} from "../../Redux/Bill/bill.action";

// Wrapper using generic DayUnifiedView with async id resolution
const DayBillsView = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { date, friendId } = useParams();
  const { hasWriteAccess } = useFriendAccess(friendId);
  const { particularDateBills = [], loading } = useSelector((s) => s.bill);

  const fetchAction = useCallback(
    (dateStr) => dispatch(getBillsByParticularDate(dateStr, friendId || "")),
    [dispatch, friendId]
  );

  // Resolve bill id for edit/delete by first obtaining bill via expense id
  const resolveBillId = async (item) => {
    const expenseId = item?.id || item?.expense?.id || item?.expenseId;
    if (!expenseId) return null;
    const bill = await dispatch(getBillByExpenseId(expenseId, friendId || ""));
    return bill?.id || null;
  };

  const deleteAction = useCallback(
    (billId) => dispatch(deleteBill(billId, friendId || "")),
    [dispatch, friendId]
  );

  const refetch = useCallback((dateStr) => fetchAction(dateStr), [fetchAction]);

  return (
    <DayUnifiedView
      type="bill"
      dateParam={date}
      friendId={friendId}
      hasWriteAccess={hasWriteAccess}
      loading={loading}
      items={particularDateBills}
      fetchAction={fetchAction}
      deleteAction={deleteAction}
      fetchAfterDelete={refetch}
      navigate={navigate}
      routes={{
        calendarBase: "/bill/calendar",
        dayBase: "/bill-day-view",
        editBase: "/bill/edit",
        createBase: "/bill/create",
      }}
      getEditTargetId={resolveBillId}
      getDeleteTargetId={resolveBillId}
      emptyTitle="No bills!"
    />
  );
};

export default DayBillsView;
