// Shared helpers for analytics report parameter construction
// Centralizes timeframe -> date range logic and optional flow/friend filters.

/**
 * Compute an inclusive UTC date range for a given timeframe keyword.
 * @param {'week'|'month'|'quarter'|'year'|'last_year'|'all_time'} timeframe
 * @param {Date} [now=new Date()] reference date (client local time, we convert to UTC boundaries)
 * @returns {{fromDate:string,toDate:string}}
 */
export function computeDateRange(timeframe, now = new Date()) {
  const to = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  );
  let from;
  switch (timeframe) {
    case "week": {
      const d = new Date(to);
      d.setUTCDate(d.getUTCDate() - 6); // last 7 days including today
      from = d;
      break;
    }
    case "quarter": {
      const d = new Date(to);
      d.setUTCMonth(d.getUTCMonth() - 2, 1); // ensure we land on month start
      from = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
      break;
    }
    case "year": {
      from = new Date(Date.UTC(to.getUTCFullYear(), 0, 1));
      break;
    }
    case "last_year": {
      const lastYear = to.getUTCFullYear() - 1;
      from = new Date(Date.UTC(lastYear, 0, 1));
      // Full last calendar year through Dec 31
      const endOfLastYear = new Date(Date.UTC(lastYear, 11, 31));
      const fmt = (dt) => dt.toISOString().slice(0, 10);
      return { fromDate: fmt(from), toDate: fmt(endOfLastYear) };
    }
    case "all_time": {
      // Global all-time reports start from 2002-01-15
      from = new Date(Date.UTC(2002, 0, 15));
      break;
    }
    case "month":
    default: {
      from = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 1));
      break;
    }
  }
  const fmt = (dt) => dt.toISOString().slice(0, 10);
  return { fromDate: fmt(from), toDate: fmt(to) };
}

/**
 * Build API params for analytics endpoints.
 * @param {object} opts
 * @param {'week'|'month'|'quarter'|'year'|'last_year'|'all_time'} opts.timeframe
 * @param {'all'|'inflow'|'outflow'} [opts.flowType]
 * @param {string|number} [opts.friendId]
 * @returns {Record<string, string|number>}
 */
export function buildReportParams({ timeframe, flowType, friendId }) {
  const { fromDate, toDate } = computeDateRange(timeframe);
  const params = { fromDate, toDate };
  if (flowType && flowType !== "all") params.flowType = flowType;
  if (friendId) params.targetId = friendId;
  return params;
}

/**
 * Convenience wrapper to refresh data given a fetch function and state setters.
 * @param {Function} apiFn - function returning promise (e.g., fetchCategoriesSummary)
 * @param {object} options
 * @param {string} options.timeframe
 * @param {string} options.flowType
 * @param {string|number} [options.friendId]
 * @returns {Promise<any>} raw api response
 */
export async function fetchWithReportParams(
  apiFn,
  { timeframe, flowType, friendId }
) {
  const params = buildReportParams({ timeframe, flowType, friendId });
  return apiFn(params);
}
