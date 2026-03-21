import { useState, useEffect, useMemo, useRef } from "react";
import { expenseApi } from "@/infrastructure/api";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import {
  cashflowApiToAreaChartModel,
  categoryApiToPieModel,
  paymentApiToPieModel,
} from "@/features/expenses/utils/expenseReportApiTransforms";
import { applyExpenseReportDailyView } from "@/features/expenses/utils/expenseReportDailyView";
import { deriveExpenseReportCardMetrics } from "@/features/expenses/utils/expenseReportCardMetrics";
import { resolveTimeframeParams, mapFlowType } from "@/shared/utils/chart/timeframeResolver";
import { buildDateRangeParams } from "@/shared/utils/chart/dataTransformers";

function mapReportFlowToApiKind(reportFlow) {
  if (reportFlow === "inflow") return "inflow";
  if (reportFlow === "outflow") return "outflow";
  return "all";
}

function mapReportFlowToPieFlow(reportFlow) {
  if (reportFlow === "all") return undefined;
  if (reportFlow === "outflow") return "loss";
  return "gain";
}

function buildCashflowParams(timeframe, reportFlow, customFrom, customTo) {
  if (customFrom && customTo) {
    if (reportFlow === "all") {
      return { startDate: customFrom, endDate: customTo };
    }
    const spendingType = reportFlow === "outflow" ? "loss" : "gain";
    const flowMapped = mapFlowType(spendingType);
    return {
      startDate: customFrom,
      endDate: customTo,
      type: spendingType,
      ...(flowMapped && { flowType: flowMapped }),
    };
  }
  if (reportFlow === "all") {
    const timeframeParams = resolveTimeframeParams(timeframe);
    return { ...timeframeParams };
  }
  const spendingType = reportFlow === "outflow" ? "loss" : "gain";
  const flowMapped = mapFlowType(spendingType);
  const timeframeParams = resolveTimeframeParams(timeframe);
  return {
    ...timeframeParams,
    type: spendingType,
    ...(flowMapped && { flowType: flowMapped }),
  };
}

function buildFilteredParamsForCustom(from, to, reportFlow) {
  const p = { fromDate: from, toDate: to };
  if (reportFlow === "all") return p;
  if (reportFlow === "outflow") {
    p.flowType = "outflow";
    p.type = "loss";
  } else {
    p.flowType = "inflow";
    p.type = "gain";
  }
  return p;
}

export function useExpenseReportApiData({
  useCustomRange,
  customFrom,
  customTo,
  dailyTimeframe,
  dailyFlowType,
  categoryTimeframe,
  categoryFlowType,
  paymentTimeframe,
  paymentFlowType,
}) {
  const { t } = useLanguage();
  const [error, setError] = useState(null);
  const [categoryRaw, setCategoryRaw] = useState(null);
  const [paymentRaw, setPaymentRaw] = useState(null);
  const [cashflowRaw, setCashflowRaw] = useState(null);
  const [groupedCashflowRaw, setGroupedCashflowRaw] = useState(null);

  const [loadingDaily, setLoadingDaily] = useState(true);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [loadingGrouped, setLoadingGrouped] = useState(true);

  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const initialGates = useRef({ daily: false, category: false, payment: false, grouped: false });

  const dailyApiKind = mapReportFlowToApiKind(dailyFlowType);

  const effectiveCustom = useMemo(() => {
    if (useCustomRange && customFrom && customTo) {
      return { from: customFrom, to: customTo };
    }
    return null;
  }, [useCustomRange, customFrom, customTo]);

  const cfParams = useMemo(
    () =>
      buildCashflowParams(
        dailyTimeframe,
        dailyFlowType,
        effectiveCustom?.from,
        effectiveCustom?.to,
      ),
    [dailyTimeframe, dailyFlowType, effectiveCustom],
  );

  const catParams = useMemo(() => {
    if (effectiveCustom) {
      return buildFilteredParamsForCustom(
        effectiveCustom.from,
        effectiveCustom.to,
        categoryFlowType,
      );
    }
    return buildDateRangeParams(categoryTimeframe, mapReportFlowToPieFlow(categoryFlowType));
  }, [effectiveCustom, categoryTimeframe, categoryFlowType]);

  const payParams = useMemo(() => {
    if (effectiveCustom) {
      return buildFilteredParamsForCustom(
        effectiveCustom.from,
        effectiveCustom.to,
        paymentFlowType,
      );
    }
    return buildDateRangeParams(paymentTimeframe, mapReportFlowToPieFlow(paymentFlowType));
  }, [effectiveCustom, paymentTimeframe, paymentFlowType]);

  const markInitialGate = (key) => {
    if (initialGates.current[key]) return;
    initialGates.current[key] = true;
    if (
      initialGates.current.daily &&
      initialGates.current.category &&
      initialGates.current.payment &&
      initialGates.current.grouped
    ) {
      setInitialLoadDone(true);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoadingDaily(true);
      const cfRes = await expenseApi.getDailySpending(cfParams);
      if (cancelled) return;
      if (cfRes.error) {
        setError(cfRes.error);
        setCashflowRaw(null);
      } else {
        setCashflowRaw(cfRes.data ?? null);
        setError(null);
      }
      setLoadingDaily(false);
      markInitialGate("daily");
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [cfParams]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoadingGrouped(true);
      const groupedParams = { ...cfParams, groupBy: true, offset: 0 };
      const groupedRes = await expenseApi.getDailySpending(groupedParams);
      if (cancelled) return;
      if (groupedRes.error) {
        setError(groupedRes.error);
        setGroupedCashflowRaw(null);
      } else {
        setGroupedCashflowRaw(groupedRes.data ?? null);
        setError(null);
      }
      setLoadingGrouped(false);
      markInitialGate("grouped");
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [cfParams]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoadingCategory(true);
      const catRes = await expenseApi.getCategoriesDetailed(catParams);
      if (cancelled) return;
      if (catRes.error) {
        setError(catRes.error);
        setCategoryRaw(null);
      } else {
        setCategoryRaw(catRes.data ?? null);
        setError(null);
      }
      setLoadingCategory(false);
      markInitialGate("category");
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [catParams]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoadingPayment(true);
      const payRes = await expenseApi.getByPaymentMethod(payParams);
      if (cancelled) return;
      if (payRes.error) {
        setError(payRes.error);
        setPaymentRaw(null);
      } else {
        setPaymentRaw(payRes.data ?? null);
        setError(null);
      }
      setLoadingPayment(false);
      markInitialGate("payment");
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [payParams]);

  const areaModelBase = useMemo(
    () => cashflowApiToAreaChartModel(cashflowRaw, dailyApiKind, t),
    [cashflowRaw, dailyApiKind, t],
  );

  const dailySpending = useMemo(
    () => applyExpenseReportDailyView(areaModelBase, dailyTimeframe, dailyApiKind),
    [areaModelBase, dailyTimeframe, dailyApiKind],
  );

  const category = useMemo(() => categoryApiToPieModel(categoryRaw), [categoryRaw]);
  const payment = useMemo(() => paymentApiToPieModel(paymentRaw), [paymentRaw]);

  const flowForMetrics =
    dailyFlowType === "inflow" ? "inflow" : dailyFlowType === "all" ? "all" : "outflow";

  const reportCards = useMemo(
    () =>
      deriveExpenseReportCardMetrics({
        categoryRaw,
        cashflowRaw,
        areaModel: dailySpending,
        flowType: flowForMetrics,
      }),
    [categoryRaw, cashflowRaw, dailySpending, flowForMetrics],
  );

  return {
    initialLoading: !initialLoadDone,
    dailyRefreshing: loadingDaily && initialLoadDone,
    categoryRefreshing: loadingCategory && initialLoadDone,
    paymentRefreshing: loadingPayment && initialLoadDone,
    groupedRefreshing: loadingGrouped && initialLoadDone,
    error,
    reportCards,
    dailySpending,
    category,
    payment,
    categoryRaw,
    paymentRaw,
    groupedCashflowRaw,
  };
}
