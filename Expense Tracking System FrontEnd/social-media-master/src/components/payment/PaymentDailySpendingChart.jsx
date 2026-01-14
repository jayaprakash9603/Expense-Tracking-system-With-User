import React, { useMemo } from "react";
import DailySpendingChart from "../../pages/Dashboard/DailySpendingChart";

const normalizeFlowTypeForChart = (flowType) => {
  const normalized = String(flowType || "").toLowerCase();
  if (normalized === "inflow") return "gain";
  if (normalized === "outflow") return "loss";
  return flowType;
};

const PaymentDailySpendingChart = ({ methods, timeframe, flowType }) => {
  const chartSelectedType = normalizeFlowTypeForChart(flowType);

  const dailySpendingData = useMemo(() => {
    const dayTypeMap = new Map();

    const methodCatalog = (Array.isArray(methods) ? methods : []).map(
      (method) => {
        const methodName = String(
          method?.method ?? method?.name ?? method?.paymentMethod ?? ""
        ).trim();
        const methodKey = methodName || "Unknown";
        return {
          methodKey,
          methodName: methodKey,
        };
      }
    );

    const toIsoDay = (value) => {
      if (!value) return null;
      const str = String(value);
      return str.includes("T") ? str.split("T")[0] : str.slice(0, 10);
    };

    const getExpenseType = (expense) =>
      String(expense?.details?.type ?? expense?.type ?? "").toLowerCase();

    const getAmount = (expense) => {
      const raw = Number(
        expense?.details?.amount ??
          expense?.amount ??
          expense?.details?.netAmount ??
          0
      );
      return Number.isFinite(raw) ? raw : 0;
    };

    for (const method of Array.isArray(methods) ? methods : []) {
      const methodName = String(
        method?.method ?? method?.name ?? method?.paymentMethod ?? ""
      ).trim();
      const methodKey = methodName || "Unknown";

      const expenses = Array.isArray(method?.expenses) ? method.expenses : [];
      for (const expense of expenses) {
        const day = toIsoDay(expense?.date ?? expense?.isoDate ?? expense?.day);
        if (!day) continue;

        const type = getExpenseType(expense);
        if (type !== "loss" && type !== "gain") continue;

        const amount = Math.abs(getAmount(expense));
        if (!amount) continue;

        const key = `${day}|${type}`;
        if (!dayTypeMap.has(key)) {
          dayTypeMap.set(key, {
            isoDate: day,
            type,
            spending: 0,
            methods: new Map(),
          });
        }

        const entry = dayTypeMap.get(key);
        entry.spending += amount;

        const prev = entry.methods.get(methodKey);
        if (prev) {
          prev.total += amount;
        } else {
          entry.methods.set(methodKey, {
            name: methodKey,
            total: amount,
          });
        }
      }
    }

    return Array.from(dayTypeMap.values())
      .map((entry) => {
        const methodTotals = methodCatalog
          .map((m) => {
            const found = entry.methods.get(m.methodKey);
            const total = found?.total ?? 0;
            return {
              name: m.methodName,
              total: Math.round(total * 100.0) / 100.0,
            };
          })
          .sort((a, b) => b.total - a.total);

        return {
          isoDate: entry.isoDate,
          type: entry.type,
          spending: Math.round(entry.spending * 100.0) / 100.0,
          budgetTotals: methodTotals,
        };
      })
      .sort((a, b) => String(a.isoDate).localeCompare(String(b.isoDate)));
  }, [methods]);

  if (!dailySpendingData.length) {
    return null;
  }

  return (
    <div className="chart-row full-width" style={{ marginBottom: 24 }}>
      <DailySpendingChart
        data={dailySpendingData}
        timeframe={timeframe}
        selectedType={chartSelectedType}
        hideControls
        showBothTypesWhenAll
        showBudgetTotalsInTooltip
        showBudgetsInTooltip
        breakdownLabel="Payment methods"
        breakdownTotalsLabel="Payment method totals"
        breakdownItemLabel="payment method"
        breakdownEmptyMessage="No payment method breakdown available."
        title="📊 Daily Spending Pattern (Payment Methods)"
      />
    </div>
  );
};

export default PaymentDailySpendingChart;
