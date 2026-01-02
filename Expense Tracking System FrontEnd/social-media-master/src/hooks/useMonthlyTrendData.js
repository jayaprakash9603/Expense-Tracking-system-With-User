import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { fetchMonthlyExpenses } from "../utils/Api";

/**
 * Hook: useMonthlyTrendData
 * Fetches and normalizes monthly expense data for a given year.
 * Supports external refreshTrigger and aborts in-flight requests on param change.
 *
 * Input:
 *  - year: number (defaults to current year if falsy)
 *  - refreshTrigger: any (change to refetch)
 *
 * Output:
 *  { data, loading, error }
 *  where data shape: { labels: string[], datasets: [{ data: number[] }] } | null
 */
export default function useMonthlyTrendData({ year, refreshTrigger }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef();

  useEffect(() => {
    const effectiveYear = Number(year) || new Date().getFullYear();

    // Abort previous
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    let mounted = true;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchMonthlyExpenses(
          { year: effectiveYear },
          { signal: controller.signal }
        );

        const MONTHS = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        let normalized = null;
        if (
          res &&
          typeof res === "object" &&
          Array.isArray(res.labels) &&
          res.datasets &&
          res.datasets[0] &&
          Array.isArray(res.datasets[0].data)
        ) {
          normalized = {
            labels: res.labels,
            datasets: [{ data: res.datasets[0].data }],
          };
        } else if (Array.isArray(res)) {
          const values = new Array(12).fill(0);
          res.forEach((item) => {
            const label = (item.label ?? item.name ?? "").toString();
            let idx = -1;
            const mNum = Number(
              item.month ?? item.monthNumber ?? item.m ?? item.index
            );
            if (!Number.isNaN(mNum)) {
              idx = Math.min(11, Math.max(0, mNum - 1));
            } else if (label) {
              const short = label.slice(0, 3).toLowerCase();
              idx = MONTHS.findIndex((m) => m.toLowerCase() === short);
              if (idx === -1) {
                idx = MONTHS.findIndex((m) =>
                  m.toLowerCase().startsWith(short)
                );
              }
            }
            if (idx >= 0 && idx < 12) {
              const v = Number(
                item.amount ??
                  item.total ??
                  item.value ??
                  item.expenses ??
                  item.sum ??
                  0
              );
              values[idx] = Number.isFinite(v) ? v : 0;
            }
          });
          normalized = { labels: MONTHS, datasets: [{ data: values }] };
        }

        if (mounted) {
          setData(normalized ?? null);
        }
      } catch (e) {
        if (
          e.name === "AbortError" ||
          axios.isCancel(e) ||
          e?.code === "ERR_CANCELED" ||
          e?.message === "canceled"
        ) {
          return; // ignore cancellations
        }
        console.error("Failed to load monthly expenses:", e);
        if (mounted) setError(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    run();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [year, refreshTrigger]);

  return { data, loading, error };
}
