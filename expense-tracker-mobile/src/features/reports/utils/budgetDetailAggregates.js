function walkExpenseRows(apiData, visitor) {
  if (!apiData || typeof apiData !== "object") return;
  Object.entries(apiData).forEach(([key, block]) => {
    if (key === "summary" || key === "metadata") return;
    const items = Array.isArray(block?.expenses) ? block.expenses : [];
    items.forEach((row) => visitor(row));
  });
}

function labelFromRow(row) {
  const det = row?.details || row?.expense || row || {};
  return det;
}

export function aggregateDetailedBudgetByCategory(apiData) {
  const buckets = {};
  let grand = 0;
  walkExpenseRows(apiData, (row) => {
    const det = labelFromRow(row);
    const cat =
      det.categoryName ||
      det.category ||
      det.expenseCategory ||
      det.expenseName ||
      "Uncategorized";
    const amt = Math.abs(Number(det.amount ?? det.netAmount ?? 0));
    grand += amt;
    if (!buckets[cat]) {
      buckets[cat] = { totalAmount: 0, expenses: [], expenseCount: 0 };
    }
    buckets[cat].totalAmount += amt;
    buckets[cat].expenseCount += 1;
    buckets[cat].expenses.push(row);
  });
  return { summary: { totalAmount: grand }, ...buckets };
}

export function aggregateDetailedBudgetByPayment(apiData) {
  const buckets = {};
  let grand = 0;
  walkExpenseRows(apiData, (row) => {
    const det = labelFromRow(row);
    const raw =
      det.paymentMethod ||
      det.paymentMethodName ||
      det.method ||
      (typeof det.paymentMethod === "string" ? det.paymentMethod : "");
    const pay = raw || "Unknown";
    const amt = Math.abs(Number(det.amount ?? det.netAmount ?? 0));
    grand += amt;
    if (!buckets[pay]) {
      buckets[pay] = { totalAmount: 0, expenses: [], expenseCount: 0 };
    }
    buckets[pay].totalAmount += amt;
    buckets[pay].expenseCount += 1;
    buckets[pay].expenses.push(row);
  });
  return { summary: { totalAmount: grand }, ...buckets };
}
