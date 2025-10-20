import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPaymentMethodsWithExpenses } from "../Redux/Payment Method/paymentMethod.action";
import { getRangeLabel } from "../utils/flowDateUtils";
import {
  buildStackedChartData,
  deterministicColor,
} from "../utils/stackedChartUtils";

/**
 * usePaymentMethodFlowData
 * Mirrors useCategoryFlowData but for payment methods.
 * Provides unified state + derived data for PaymentMethodFlow component.
 */
export default function usePaymentMethodFlowData({
  friendId,
  isFriendView,
  search,
}) {
  const dispatch = useDispatch();
  const [activeRange, setActiveRange] = useState("month");
  const [offset, setOffset] = useState(0);
  const [flowTab, setFlowTab] = useState("all");
  const { paymentMethodExpenses, loading } = useSelector(
    (s) => s.paymentMethod || {}
  );

  // Fetch payment methods with expenses on dependency changes
  useEffect(() => {
    dispatch(
      fetchPaymentMethodsWithExpenses(activeRange, offset, flowTab, friendId)
    );
  }, [activeRange, offset, flowTab, dispatch, friendId]);

  // Reset offset when range changes
  useEffect(() => {
    setOffset(0);
  }, [activeRange]);

  // Compute totals aggregated across all payment method expenses
  const totals = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    if (paymentMethodExpenses) {
      Object.keys(paymentMethodExpenses)
        .filter((k) => k !== "summary")
        .forEach((pmName) => {
          const pm = paymentMethodExpenses[pmName];
          const expenses = Array.isArray(pm?.expenses) ? pm.expenses : [];
          expenses.forEach((e) => {
            if (!e) return;
            const details = e.details || e;
            const amt = Number(details.amount || e.amount || 0);
            const type = (details.type || e.type || "").toLowerCase();
            if (["gain", "income", "inflow"].includes(type)) inflow += amt;
            else outflow += amt;
          });
        });
    }
    return { inflow, outflow, total: inflow + outflow };
  }, [paymentMethodExpenses]);

  // Derive pieData & payment method cards
  const { pieData, paymentMethodCards } = useMemo(() => {
    if (!paymentMethodExpenses || !paymentMethodExpenses.summary) {
      return { pieData: [], paymentMethodCards: [] };
    }
    const methods = Object.keys(paymentMethodExpenses)
      .filter((k) => k !== "summary")
      .map((k) => ({
        name: k,
        ...paymentMethodExpenses[k],
        value: paymentMethodExpenses[k].totalAmount,
      }));
    const cards = methods.map((m) => ({
      categoryName: m.name, // maintain existing naming to reduce downstream changes
      categoryId: m.id,
      totalAmount: m.totalAmount,
      expenseCount: m.expenseCount || 0,
      color: m.color || deterministicColor(m.name),
      expenses: m.expenses || [],
    }));
    return {
      pieData: methods.map((pm) => ({
        name: pm.name,
        value: pm.totalAmount,
        color: pm.color || deterministicColor(pm.name),
      })),
      paymentMethodCards: cards,
    };
  }, [paymentMethodExpenses]);

  // Build stacked chart data using shared util
  const { barSegments, stackedChartData, xAxisKey } = useMemo(
    () =>
      buildStackedChartData({
        entityExpenses: paymentMethodExpenses,
        activeRange,
        offset,
        keyPrefix: "pm",
        colorAccessor: (name, entity) =>
          entity?.color || deterministicColor(name),
      }),
    [paymentMethodExpenses, activeRange, offset]
  );

  const rangeLabel = getRangeLabel(activeRange, offset, "paymentMethod");

  return {
    activeRange,
    setActiveRange,
    offset,
    setOffset,
    flowTab,
    setFlowTab,
    loading,
    paymentMethodExpenses,
    totals,
    pieData,
    paymentMethodCards,
    barSegments,
    stackedChartData,
    xAxisKey,
    rangeLabel,
  };
}
