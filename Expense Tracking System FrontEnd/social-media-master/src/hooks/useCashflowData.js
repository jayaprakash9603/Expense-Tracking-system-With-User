import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { fetchCashflowExpenses } from "../Redux/Expenses/expense.action";
import { getRangeLabel, weekDays, yearMonths } from "../utils/flowDateUtils";

export default function useCashflowData({ friendId, isFriendView, search }) {
  const dispatch = useDispatch();
  // Default to 'month' to align with CategoryFlow initial range
  const [activeRange, setActiveRange] = useState("month");
  const [offset, setOffset] = useState(0);
  const [flowTab, setFlowTab] = useState("all");
  const { cashflowExpenses, loading } = useSelector((s) => s.expenses || {});
  const { settings } = useSelector((s) => s.userSettings || {});
  const maskSensitiveData = settings?.maskSensitiveData;

  // fetch
  useEffect(() => {
    dispatch(
      fetchCashflowExpenses({
        range: activeRange,
        offset,
        flowType: flowTab === "all" ? null : flowTab,
        // category intentionally null for base cashflow screen filtering by text search only
        // type left undefined to fetch both loss & gain unless flowTab narrows via flowType
        targetId: isFriendView ? friendId : undefined,
        groupBy: false, // flat list for timeline visualization
      })
    );
  }, [activeRange, offset, flowTab, dispatch, friendId, isFriendView, maskSensitiveData]);

  // reset offset when range changes
  useEffect(() => {
    setOffset(0);
  }, [activeRange]);

  const filteredExpensesForView = useMemo(() => {
    const list = Array.isArray(cashflowExpenses) ? cashflowExpenses : [];
    const q = (search || "").toLowerCase().trim();
    if (!q) return list;
    return list.filter((item) => {
      const exp = item?.expense || {};
      const name = (exp.expenseName || item.name || "").toLowerCase();
      const comments = (exp.comments || item.comments || "").toLowerCase();
      const amountStr = String(exp.amount ?? item.amount ?? "").toLowerCase();
      const category = (
        item.categoryName ||
        item.category?.name ||
        item.category ||
        ""
      )
        .toString()
        .toLowerCase();
      return (
        name.includes(q) ||
        comments.includes(q) ||
        amountStr.includes(q) ||
        category.includes(q)
      );
    });
  }, [cashflowExpenses, search]);

  const { chartData, cardData } = useMemo(() => {
    if (
      !Array.isArray(filteredExpensesForView) ||
      filteredExpensesForView.length === 0
    ) {
      return { chartData: [], cardData: [] };
    }
    if (activeRange === "week") {
      const weekMap = {};
      weekDays.forEach(
        (d) => (weekMap[d] = { day: d, amount: 0, expenses: [] })
      );
      filteredExpensesForView.forEach((item) => {
        const date = item.date || item.expense?.date;
        const dayIdx = dayjs(date).day();
        const weekDay = weekDays[(dayIdx + 6) % 7]; // shift to start Monday
        weekMap[weekDay].amount += item.expense?.amount || 0;
        weekMap[weekDay].expenses.push(item);
      });
      return {
        chartData: weekDays.map((d) => ({
          day: d,
          amount: weekMap[d].amount,
          expenses: weekMap[d].expenses,
        })),
        cardData: weekDays.flatMap((d) =>
          weekMap[d].expenses.map((item) => ({
            ...item,
            day: d,
            name: item.expense?.expenseName || "",
            amount: item.expense?.amount || 0,
            comments: item.expense?.comments || "",
          }))
        ),
      };
    }
    if (activeRange === "month") {
      const targetMonth = dayjs().startOf("month").add(offset, "month");
      const daysInMonth = targetMonth.daysInMonth();
      const monthMap = {};
      for (let i = 1; i <= daysInMonth; i++) {
        monthMap[i] = { day: i, amount: 0, expenses: [] };
      }
      filteredExpensesForView.forEach((item) => {
        const date = item.date || item.expense?.date;
        const d = dayjs(date);
        if (d.isSame(targetMonth, "month")) {
          const day = d.date();
          if (monthMap[day]) {
            monthMap[day].amount += item.expense?.amount || 0;
            monthMap[day].expenses.push(item);
          }
        }
      });
      return {
        chartData: Array.from({ length: daysInMonth }, (_, i) => ({
          day: (i + 1).toString(),
          amount: monthMap[i + 1].amount,
          expenses: monthMap[i + 1].expenses,
        })),
        cardData: Array.from({ length: daysInMonth }, (_, i) =>
          monthMap[i + 1].expenses.map((item) => ({
            ...item,
            day: (i + 1).toString(),
            name: item.expense?.expenseName || "",
            amount: item.expense?.amount || 0,
            comments: item.expense?.comments || "",
          }))
        ).flat(),
      };
    }
    if (activeRange === "year") {
      const targetYear = dayjs().add(offset, "year").year();
      const yearMap = {};
      yearMonths.forEach(
        (m, idx) => (yearMap[idx] = { month: m, amount: 0, expenses: [] })
      );
      filteredExpensesForView.forEach((item) => {
        const date = item.date || item.expense?.date;
        const d = dayjs(date);
        if (d.year() === targetYear) {
          const monthIdx = d.month();
          yearMap[monthIdx].amount += item.expense?.amount || 0;
          yearMap[monthIdx].expenses.push(item);
        }
      });
      return {
        chartData: yearMonths.map((m, idx) => ({
          month: m,
          amount: yearMap[idx].amount,
          expenses: yearMap[idx].expenses,
        })),
        cardData: yearMonths.flatMap((m, idx) =>
          yearMap[idx].expenses.map((item) => ({
            ...item,
            month: m,
            name: item.expense?.expenseName || "",
            amount: item.expense?.amount || 0,
            comments: item.expense?.comments || "",
          }))
        ),
      };
    }
    return { chartData: [], cardData: [] };
  }, [filteredExpensesForView, activeRange, offset]);

  const xKey =
    activeRange === "week" ? "day" : activeRange === "month" ? "day" : "month";

  const totals = useMemo(() => {
    let inflow = 0,
      outflow = 0;
    filteredExpensesForView.forEach((item) => {
      const amount = item.expense?.amount || item.amount || 0;
      const type = (item.type || item.expense?.type || "outflow").toLowerCase();
      if (type === "inflow" || type === "gain") inflow += amount;
      else outflow += amount;
    });
    return { inflow, outflow, total: inflow + outflow };
  }, [filteredExpensesForView]);

  const rangeLabel = getRangeLabel(activeRange, offset, "cashflow");

  const barChartStyles = {
    barWidth: 20,
    hideNumbers: false,
    hideAxisLabels: false,
  };

  return {
    activeRange,
    setActiveRange,
    offset,
    setOffset,
    flowTab,
    setFlowTab,
    cashflowExpenses,
    loading,
    chartData,
    cardData,
    xKey,
    barChartStyles,
    totals,
    rangeLabel,
  };
}
