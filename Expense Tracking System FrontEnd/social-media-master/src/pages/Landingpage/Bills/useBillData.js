import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { fetchBills, deleteBill } from "../../../Redux/Bill/bill.action";
// import { fetchBills, deleteBill } from '../Redux/Bill/bill.action';

export const useBillData = (friendId) => {
  const [billsData, setBillsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const fetchBillsData = useCallback(
    async (month, year, targetId) => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching bills for month: ${month}, year: ${year}`);

        const responseData = await dispatch(fetchBills(month, year, friendId));
        setBillsData(responseData || []);
        console.log("Bills fetched for", `${month}/${year}:`, responseData);
      } catch (error) {
        console.error("Error fetching bills:", error);
        setError(error.message);
        setBillsData([]);
      } finally {
        setLoading(false);
      }
    },
    [dispatch, friendId]
  );

  const deleteBillData = useCallback(
    async (billId) => {
      try {
        setLoading(true);
        await dispatch(deleteBill(billId, friendId || ""));
        return true;
      } catch (error) {
        setError(error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [dispatch, friendId]
  );

  return {
    billsData,
    loading,
    error,
    fetchBillsData,
    deleteBillData,
    setBillsData,
  };
};
