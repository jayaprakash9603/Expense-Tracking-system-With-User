export function mapRawDataToGroups(rawData) {
  if (!rawData || typeof rawData !== "object") return [];

  const summary = rawData.summary || {};
  const grandTotal = Number(summary.totalAmount || 0);

  return Object.entries(rawData)
    .filter(([k]) => k !== "summary" && k !== "metadata")
    .map(([methodName, block]) => {
      const total = Number(block?.totalAmount || block?.total || 0);
      const rawItems = Array.isArray(block?.expenses)
        ? block.expenses
        : Array.isArray(block?.items)
          ? block.items
          : [];

      const items = [...rawItems].sort((a, b) => {
        const detA = a?.details || a?.expense || a || {};
        const detB = b?.details || b?.expense || b || {};
        const aAmt = Number(detA?.amount ?? detA?.netAmount ?? 0);
        const bAmt = Number(detB?.amount ?? detB?.netAmount ?? 0);
        return bAmt - aAmt;
      });

      const count = Number(block?.expenseCount || block?.count || items.length);
      const percentage = grandTotal > 0 ? ((total / grandTotal) * 100).toFixed(2) : "0.00";
      const avgPerTransaction = count > 0 ? (total / count).toFixed(2) : "0.00";

      const creditDueTotal = items.reduce((sum, row) => {
        const details = row?.details || row?.expense || row || {};
        return sum + Number(details?.creditDue || 0);
      }, 0);

      return {
        key: methodName,
        label: methodName,
        totalAmount: total,
        count,
        items,
        percentage,
        avgPerTransaction,
        creditDueTotal,
      };
    })
    .sort((a, b) => Number(b.totalAmount) - Number(a.totalAmount));
}
