import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useFlowData } from "@/shared/hooks/flow/useFlowData";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { fetchBillsAction } from "@/redux/bills/bills.actions";
import { selectBillList } from "@/redux/selectors";
import { fromApiResponse } from "@/domain/bills/bill.transformers";
import {
  buildBillChartRows,
  getFlowRangeBounds,
  isDateInFlowRange,
} from "@/domain/bills/billsFlowChart";

const SPARK_BUCKET_COUNT = 8;

function buildBillSparkSeries(billsInRange, rangeStart, rangeEnd) {
  const count = Array(SPARK_BUCKET_COUNT).fill(0);
  const income = Array(SPARK_BUCKET_COUNT).fill(0);
  const expense = Array(SPARK_BUCKET_COUNT).fill(0);
  const start = new Date(`${rangeStart}T12:00:00`).getTime();
  const end = new Date(`${rangeEnd}T12:00:00`).getTime();
  const span = Math.max(1, end - start);
  billsInRange.forEach((raw) => {
    const b = fromApiResponse(raw);
    const slice = b.date && String(b.date).slice(0, 10);
    if (!slice) return;
    const t = new Date(`${slice}T12:00:00`).getTime();
    const ratio = Math.min(1, Math.max(0, (t - start) / span));
    const idx = Math.min(
      SPARK_BUCKET_COUNT - 1,
      Math.floor(ratio * SPARK_BUCKET_COUNT),
    );
    const amt = Math.abs(Number(b.amount) || 0);
    count[idx] += 1;
    if (b.type === "gain") income[idx] += amt;
    else expense[idx] += amt;
  });
  const net = income.map((v, i) => v - expense[i]);
  return { count, income, expense, net };
}

function mapBillToFlowCard(raw, t) {
  const bill = fromApiResponse(raw);
  const isGain = bill.type === "gain";
  return {
    id: bill.id,
    name: bill.name,
    amount: Math.abs(Number(bill.amount) || 0),
    date: bill.date,
    type: isGain ? "gain" : "loss",
    categoryName: isGain ? t("dashboard.gain") : t("dashboard.loss"),
    paymentMethod: bill.paymentMethod,
    description: bill.description,
    comments: bill.description,
  };
}

function toChartBillShape(raw) {
  const bill = fromApiResponse(raw);
  return {
    date: bill.date,
    amount: bill.amount,
    flowType: bill.type === "gain" ? "gain" : "loss",
  };
}

export function useBillsFlowData() {
  const { t } = useLanguage();
  const paramsBuilder = useCallback(({ activeRange, offset }) => {
    const { rangeStart, rangeEnd } = getFlowRangeBounds(activeRange, offset);
    return {
      startDate: rangeStart,
      endDate: rangeEnd,
    };
  }, []);

  const flow = useFlowData({
    storagePrefix: "billsFlow",
    fetchAction: fetchBillsAction,
    paramsBuilder,
    refetchOnFlowTabChange: false,
  });

  const rawList = useSelector(selectBillList) || [];
  const { rangeStart, rangeEnd } = useMemo(
    () => getFlowRangeBounds(flow.activeRange, flow.offset),
    [flow.activeRange, flow.offset],
  );

  const billsInRange = useMemo(
    () => rawList.filter((raw) => {
      const bill = fromApiResponse(raw);
      return isDateInFlowRange(bill.date, rangeStart, rangeEnd);
    }),
    [rawList, rangeStart, rangeEnd],
  );

  const chartData = useMemo(() => {
    const mapped = billsInRange.map(toChartBillShape);
    const tab =
      flow.flowTab === "all"
        ? "all"
        : flow.flowTab === "inflow"
          ? "inflow"
          : "outflow";
    return buildBillChartRows(mapped, flow.activeRange, tab, rangeStart);
  }, [billsInRange, flow.activeRange, flow.flowTab, rangeStart]);

  const cardData = useMemo(() => {
    const filtered = billsInRange.filter((raw) => {
      const bill = fromApiResponse(raw);
      if (flow.flowTab === "inflow") return bill.type === "gain";
      if (flow.flowTab === "outflow") return bill.type === "loss";
      return true;
    });
    return filtered
      .map((raw) => mapBillToFlowCard(raw, t))
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [billsInRange, flow.flowTab, t]);

  const chartConfig = useMemo(
    () => ({
      income: { label: t("dashboard.gain"), color: "hsl(var(--chart-7))" },
      expense: { label: t("dashboard.loss"), color: "hsl(var(--chart-4))" },
    }),
    [t],
  );

  const overviewStats = useMemo(() => {
    let incomeCount = 0;
    let expenseCount = 0;
    let incomeSum = 0;
    let expenseSum = 0;
    billsInRange.forEach((raw) => {
      const b = fromApiResponse(raw);
      const amt = Math.abs(Number(b.amount) || 0);
      if (b.type === "gain") {
        incomeCount += 1;
        incomeSum += amt;
      } else {
        expenseCount += 1;
        expenseSum += amt;
      }
    });
    const spark = buildBillSparkSeries(billsInRange, rangeStart, rangeEnd);
    return {
      allCount: billsInRange.length,
      incomeCount,
      expenseCount,
      incomeSum,
      expenseSum,
      netSum: incomeSum - expenseSum,
      sparkBills: spark.count,
      sparkIncome: spark.income,
      sparkExpense: spark.expense,
      sparkNet: spark.net,
    };
  }, [billsInRange, rangeStart, rangeEnd]);

  const accordionRawBills = useMemo(() => {
    const filtered = billsInRange.filter((raw) => {
      const b = fromApiResponse(raw);
      if (flow.flowTab === "inflow") return b.type === "gain";
      if (flow.flowTab === "outflow") return b.type === "loss";
      return true;
    });
    return filtered.sort((a, b) => {
      const da = fromApiResponse(a).date || "";
      const db = fromApiResponse(b).date || "";
      return db.localeCompare(da);
    });
  }, [billsInRange, flow.flowTab]);

  return {
    ...flow,
    chartData,
    cardData,
    chartConfig,
    billsInRange,
    overviewStats,
    accordionRawBills,
  };
}
