import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategoriesWithExpenses } from "../Redux/Expenses/expense.action";
import { getRangeLabel } from "../utils/flowDateUtils";
import {
  buildStackedChartData,
  deterministicColor,
} from "../utils/stackedChartUtils";

/**
 * useCategoryFlowData
 * Handles fetching and transforming category + expense data for CategoryFlow.
 * Mirrors patterns from useCashflowData for consistency & reusability.
 *
 * Inputs: friendId, isFriendView, search
 * Outputs: activeRange, setActiveRange, offset, setOffset, flowTab, setFlowTab,
 *          loading, rawCategoryExpenses, pieData, categoryCards, stackedChartData,
 *          barSegments, xAxisKey, totals, rangeLabel.
 */
export default function useCategoryFlowData({
  friendId,
  isFriendView,
  search,
}) {
  const dispatch = useDispatch();
  const [activeRange, setActiveRange] = useState("month");
  const [offset, setOffset] = useState(0);
  const [flowTab, setFlowTab] = useState("all");
  const { categoryExpenses, loading } = useSelector((s) => s.expenses || {});

  // Fetch categories with expenses whenever dependencies change
  useEffect(() => {
    dispatch(
      fetchCategoriesWithExpenses(activeRange, offset, flowTab, friendId)
    );
  }, [activeRange, offset, flowTab, dispatch, friendId]);

  // Reset offset when range changes (match existing logic)
  useEffect(() => {
    setOffset(0);
  }, [activeRange]);

  // Compute totals (inflow/outflow) aggregated across all category expenses
  const totals = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    if (categoryExpenses) {
      Object.keys(categoryExpenses)
        .filter((k) => k !== "summary")
        .forEach((catName) => {
          const cat = categoryExpenses[catName];
          const expenses = Array.isArray(cat?.expenses) ? cat.expenses : [];
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
  }, [categoryExpenses]);

  // Deterministic color utility now imported (deterministicColor)

  // Derive pieData & categoryCards from categoryExpenses
  const { pieData, categoryCards } = useMemo(() => {
    if (!categoryExpenses || !categoryExpenses.summary) {
      return { pieData: [], categoryCards: [] };
    }
    const categories = Object.keys(categoryExpenses)
      .filter((k) => k !== "summary")
      .map((k) => ({
        name: k,
        ...categoryExpenses[k],
        value: categoryExpenses[k].totalAmount,
      }));
    const cards = categories.map((c) => ({
      categoryName: c.name,
      categoryId: c.id,
      totalAmount: c.totalAmount,
      expenseCount: c.expenseCount || 0,
      color: c.color || deterministicColor(c.name),
      expenses: c.expenses || [],
    }));
    return {
      pieData: categories.map((cat) => ({
        name: cat.name,
        value: cat.totalAmount,
        color: cat.color || deterministicColor(cat.name),
      })),
      categoryCards: cards,
    };
  }, [categoryExpenses]);

  // Build stacked multi-bar data using shared utility
  const { barSegments, stackedChartData, xAxisKey } = useMemo(
    () =>
      buildStackedChartData({
        entityExpenses: categoryExpenses,
        activeRange,
        offset,
        keyPrefix: "cat",
        colorAccessor: (name, entity) =>
          entity?.color || deterministicColor(name),
      }),
    [categoryExpenses, activeRange, offset]
  );

  const rangeLabel = getRangeLabel(activeRange, offset, "category");

  return {
    activeRange,
    setActiveRange,
    offset,
    setOffset,
    flowTab,
    setFlowTab,
    loading,
    categoryExpenses,
    totals,
    pieData,
    categoryCards,
    barSegments,
    stackedChartData,
    xAxisKey,
    rangeLabel,
  };
}
