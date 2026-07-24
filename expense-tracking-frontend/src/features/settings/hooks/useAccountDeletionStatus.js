import { useCallback, useEffect, useState } from "react";
import {
  cancelSelfDeletion,
  fetchDeletionStatus,
} from "../services/accountDeletionService";

export const useAccountDeletionStatus = ({ enabled = true } = {}) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setStatus(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchDeletionStatus();
      setStatus(data);
      return data;
    } catch (e) {
      setError(
        e?.response?.data?.message || e.message || "Failed to load deletion status",
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const cancelDeletion = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    try {
      const data = await cancelSelfDeletion();
      setStatus(null);
      return data;
    } catch (e) {
      setError(
        e?.response?.data?.message || e.message || "Failed to cancel deletion",
      );
      throw e;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const isPending = status?.state === "REQUESTED";

  return {
    status,
    loading,
    error,
    submitting,
    isPending,
    refresh,
    cancelDeletion,
  };
};

export default useAccountDeletionStatus;
