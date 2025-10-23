import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllPaymentMethods } from "../Redux/Payment Method/paymentMethod.action";
import { processPaymentMethods } from "../utils/paymentMethodUtils";

/**
 * Custom hook for payment method management
 * Handles fetching, processing, and filtering payment methods
 *
 * @param {string} friendId - Optional friend ID for fetching friend-specific payment methods
 * @param {string} transactionType - "loss" (expense) or "gain" (income)
 * @param {boolean} autofetch - Whether to automatically fetch payment methods (default: true)
 * @returns {Object} Payment methods data and actions
 */
const usePaymentMethods = (
  friendId = "",
  transactionType = "loss",
  autofetch = true
) => {
  const dispatch = useDispatch();

  // Local state for payment methods
  const [localPaymentMethods, setLocalPaymentMethods] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Redux state (optional, if you want to use Redux store)
  const {
    paymentMethods: reduxPaymentMethods = [],
    loading: reduxLoading = false,
    error: reduxError = null,
  } = useSelector((state) => state.paymentMethods || {});

  // Fetch payment methods
  const fetchPaymentMethods = async () => {
    try {
      setLocalLoading(true);
      setLocalError(null);

      const resultAction = await dispatch(
        fetchAllPaymentMethods(friendId || "")
      );

      const paymentMethodsData = resultAction?.payload || resultAction || [];
      const validData = Array.isArray(paymentMethodsData)
        ? paymentMethodsData
        : [];

      // Deduplicate API results by name before storing
      const deduplicatedData = Array.from(
        new Map(validData.map((pm) => [pm.name?.toLowerCase(), pm])).values()
      );

      setLocalPaymentMethods(deduplicatedData);
      setLocalLoading(false);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      setLocalError(error.message || "Failed to fetch payment methods");
      setLocalPaymentMethods([]);
      setLocalLoading(false);
    }
  };

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autofetch) {
      fetchPaymentMethods();
    }
  }, [friendId, autofetch]);

  // Process payment methods based on transaction type
  const processedPaymentMethods = useMemo(() => {
    return processPaymentMethods(
      localPaymentMethods,
      transactionType,
      true // useDefaults
    );
  }, [localPaymentMethods, transactionType]);

  // Determine loading and error states
  const loading = localLoading || reduxLoading;
  const error = localError || reduxError;

  return {
    paymentMethods: localPaymentMethods,
    processedPaymentMethods,
    loading,
    error,
    refetch: fetchPaymentMethods,
  };
};

export default usePaymentMethods;
