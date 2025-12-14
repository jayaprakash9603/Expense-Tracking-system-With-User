import { useEffect, useState } from "react";
import { api } from "../config/api";

export default function useApplicationOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchOverview = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/analytics/overview");
        if (!cancelled) {
          setData(response.data || null);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err?.response?.data?.message ||
            "Failed to load application overview";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchOverview();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
