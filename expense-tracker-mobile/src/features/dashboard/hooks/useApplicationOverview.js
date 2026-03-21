import { useEffect, useState, useCallback } from "react";
import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/network/safeApiCall";

export function useApplicationOverview(refreshKey = 0) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: result, error: err } = await safeApiCall(() =>
      api.get("/api/analytics/overview")
    );
    if (err) {
      setError(err.message);
    } else {
      setData(result);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch, refreshKey]);

  return { data, loading, error, refetch: fetch };
}

export default useApplicationOverview;
