import { api } from "../config/api";

/**
 * Fetch daily spending from backend.
 * params: { startDate, endDate, timeframe }
 * Expected backend shape: { dailySpending: [{ day: '2025-08-01', spending: 123 }, ...] }
 * Returns normalized array: [{ day: '2025-08-01', spending: 123 }, ...]
 */
export async function fetchDailySpending(params = {}) {
  try {
    const res = await api.get("/api/expenses/daily-spending", {
      params,
    });
    const raw = res.data?.dailySpending ?? res.data ?? [];
    return (Array.isArray(raw) ? raw : []).map((item) => ({
      day: item.day ?? item.date ?? item.label ?? "",
      spending: Number(item.spending ?? item.amount ?? item.value ?? 0),
    }));
  } catch (err) {
    // Bubble error to caller; caller can fallback to sample data
    throw err;
  }
}

/**
 * Fetch expense summary from backend.
 * Endpoint: GET /api/expenses/summary-expenses
 * Optional params are forwarded as query string, e.g. { month, year, fromDate, toDate, type }
 * Returns the raw response body (object with summary fields as provided by backend).
 */
export async function fetchExpenseSummary(params = {}) {
  try {
    const res = await api.get("/api/expenses/summary-expenses", { params });
    return res.data ?? {};
  } catch (err) {
    throw err;
  }
}

/**
 * Fetch monthly expenses from backend.
 * Endpoint: GET /api/expenses/monthly
 * Optional params forwarded as query string (e.g., { year } or date ranges).
 * Returns raw response body; caller can shape as needed.
 */
export async function fetchMonthlyExpenses(params = {}) {
  try {
    const res = await api.get("/api/expenses/monthly", { params });
    return res.data ?? [];
  } catch (err) {
    throw err;
  }
}

/**
 * Fetch payment method distribution (supports date range OR dynamic rangeType/offset).
 * New endpoint: GET /api/expenses/payment-methods/filtered
 * Params options:
 *  - { fromDate, toDate, flowType, type }
 *  - OR { rangeType: 'week'|'month'|'year', offset, flowType, type }
 * The backend returns a map/object; we just pass it through.
 */
export async function fetchPaymentMethods(params = {}) {
  try {
    const res = await api.get("/api/expenses/payment-methods/filtered", { params });
    return res.data ?? {};
  } catch (err) {
    throw err;
  }
}

/**
 * Fetch categories distribution/summary.
 * Endpoint (assumed): GET /api/categories/summary
 * Optional params forwarded as query string (e.g., { month, year, fromDate, toDate, type }).
 * Returns the raw response body; expected shape includes { summary: { totalAmount, categoryTotals: {...} }, ... }
 */
export async function fetchCategoriesSummary(params = {}) {
  try {
    // Endpoint requires fromDate and toDate (YYYY-MM-DD)
    const res = await api.get(
      "/api/expenses/all-by-categories/detailed/filtered",
      { params }
    );
    return res.data ?? {};
  } catch (err) {
    throw err;
  }
}

export async function fetchPaymentSummary(params = {}) {
  try {
    // Endpoint requires fromDate and toDate (YYYY-MM-DD)
    const res = await api.get(
      "/api/expenses/all-by-payment-method/detailed/filtered",
      { params }
    );
    return res.data ?? {};
  } catch (err) {
    throw err;
  }
}

export default fetchDailySpending;
