/**
 * Data Transformers - Reusable functions to normalize API responses
 *
 * These transformers handle multiple API response shapes and convert them
 * into consistent formats for consumption by UI components.
 */

/**
 * Normalize payment method data to chart-friendly format
 *
 * Accepts multiple input shapes:
 * 1. Chart-ready: { labels: [], datasets: [{ data: [] }] }
 * 2. Array of items: [{ label/name/method, amount/total/value }]
 * 3. Summary shape: { summary: { paymentMethodTotals: { method: amount } } }
 * 4. Per-method blocks: { methodName: { totalAmount }, ... }
 * 5. Simple map: { methodName: amount }
 *
 * @param {*} rawData - Raw API response
 * @returns {{ labels: string[], datasets: [{ data: number[] }] } | null}
 */
export function normalizePaymentMethodData(rawData) {
  if (!rawData) return null;

  // 1) Chart-ready format - pass through
  if (
    typeof rawData === "object" &&
    Array.isArray(rawData.labels) &&
    rawData.datasets?.[0]?.data &&
    Array.isArray(rawData.datasets[0].data)
  ) {
    return {
      labels: rawData.labels,
      datasets: [{ data: rawData.datasets[0].data }],
    };
  }

  // 2) Array of items
  if (Array.isArray(rawData)) {
    const labels = [];
    const values = [];
    rawData.forEach((item) => {
      const label = (item.label ?? item.name ?? item.method ?? "").toString();
      const value = Number(
        item.amount ?? item.total ?? item.value ?? item.count ?? 0
      );
      if (label) {
        labels.push(label);
        values.push(Number.isFinite(value) ? value : 0);
      }
    });
    return labels.length ? { labels, datasets: [{ data: values }] } : null;
  }

  if (typeof rawData === "object") {
    // 3) Summary shape with paymentMethodTotals
    if (rawData.summary?.paymentMethodTotals) {
      const totals = rawData.summary.paymentMethodTotals;
      const labels = Object.keys(totals);
      const values = labels.map((k) => Number(totals[k] ?? 0));
      return labels.length ? { labels, datasets: [{ data: values }] } : null;
    }

    // 4) Per-method blocks with totalAmount
    const methodKeys = Object.keys(rawData).filter((k) => k !== "summary");
    const hasTotals = methodKeys.some(
      (k) => rawData[k] && (rawData[k].totalAmount || rawData[k].total)
    );

    if (hasTotals) {
      const labels = [];
      const values = [];
      methodKeys.forEach((k) => {
        const block = rawData[k] || {};
        const val = Number(block.totalAmount ?? block.total ?? 0) || 0;
        labels.push(k);
        values.push(val);
      });
      return labels.length ? { labels, datasets: [{ data: values }] } : null;
    }

    // 5) Fallback: simple map
    const labels = Object.keys(rawData);
    const values = labels.map((k) => Number(rawData[k] ?? 0));
    return labels.length ? { labels, datasets: [{ data: values }] } : null;
  }

  return null;
}

/**
 * Normalize category data to pie chart format
 *
 * Accepts:
 * 1. Array: [{ name, value }]
 * 2. Summary shape: { summary: { categoryTotals: { category: amount } } }
 *
 * @param {*} rawData - Raw API response
 * @returns {{ items: Array<{ name: string, value: number }>, total: number }}
 */
export function normalizeCategoryData(rawData) {
  if (!rawData) return { items: [], total: 0 };

  // 1) Array format
  if (Array.isArray(rawData)) {
    const items = rawData.map((d) => ({
      name: d.name,
      value: Number(d.value) || 0,
    }));
    const total = items.reduce((sum, item) => sum + item.value, 0);
    return { items, total };
  }

  // 2) Summary shape
  if (typeof rawData === "object" && rawData.summary?.categoryTotals) {
    const totals = rawData.summary.categoryTotals;
    const items = Object.keys(totals).map((k) => ({
      name: k,
      value: Number(totals[k]) || 0,
    }));
    const total = Number(rawData.summary.totalAmount || 0);
    return { items, total };
  }

  return { items: [], total: 0 };
}

/**
 * Extract spending data by key from API response
 *
 * @param {Object} rawData - Raw API response
 * @param {string} key - Key to extract (e.g., 'categories', 'methods')
 * @param {*} defaultValue - Default value if key not found
 * @returns {*} Extracted value
 */
export function extractDataByKey(rawData, key, defaultValue = []) {
  if (!rawData || typeof rawData !== "object") return defaultValue;
  return rawData[key] ?? defaultValue;
}

/**
 * Build friendly label from raw key
 *
 * @param {string} key - Raw key (e.g., 'creditNeedToPaid')
 * @returns {string} Friendly label
 */
export function buildFriendlyLabel(key) {
  const labelMap = {
    creditNeedToPaid: "Credit (Due)",
    cash: "Cash",
    upi: "UPI",
    card: "Card",
    creditCard: "Credit Card",
    debitCard: "Debit Card",
    netBanking: "Net Banking",
  };

  return (
    labelMap[key] ||
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  );
}

/**
 * Apply friendly labels to normalized data
 *
 * @param {{ labels: string[], datasets: any[] }} data
 * @returns {{ labels: string[], datasets: any[] }}
 */
export function applyFriendlyLabels(data) {
  if (!data || !data.labels) return data;

  return {
    ...data,
    labels: data.labels.map(buildFriendlyLabel),
  };
}
