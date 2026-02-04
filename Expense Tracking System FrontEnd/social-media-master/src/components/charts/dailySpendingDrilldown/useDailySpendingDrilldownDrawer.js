import { useCallback, useEffect, useMemo, useState } from "react";

import {
  buildCsv,
  buildTsvForClipboard,
  formatDateLabel,
  normalizeExpenseForList,
  toNumber,
} from "../../../utils/dailySpendingDrilldownUtils";

const ROWS_PER_PAGE_OPTIONS = [5, 10, 20, 50, 100];
const BASE_VISIBLE_ROWS = 5;

const computeDrawerTitle = (point) => {
  if (!point) return "Details";

  const hasMonthBucket =
    point?.monthIndex !== undefined && point?.monthIndex !== null;

  return hasMonthBucket ? "Month overview" : "Day details";
};

export default function useDailySpendingDrilldownDrawer({
  point,
  breakdownLabel,
  breakdownEmptyMessage,
  breakdownItemLabel,
  activeListType = "all",
  locale,
  currencySymbol,
  cardHeight,
  listGapPx,
}) {
  const isAllView =
    typeof point?.spendingLoss !== "undefined" ||
    typeof point?.spendingGain !== "undefined";

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const dateLabel = useMemo(
    () => formatDateLabel(point, locale),
    [point, locale]
  );

  const drawerTitle = useMemo(() => computeDrawerTitle(point), [point]);

  const formatMoney = useCallback(
    (value) => {
      const numeric = Number(value);
      const safe = Number.isFinite(numeric) ? numeric : 0;
      return `${currencySymbol}${safe.toLocaleString(locale || undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })}`;
    },
    [currencySymbol, locale]
  );

  const totals = useMemo(() => {
    if (!point) {
      return { spendingLoss: 0, spendingGain: 0, spending: 0, net: 0 };
    }

    if (isAllView) {
      const spendingLoss = toNumber(point.spendingLoss);
      const spendingGain = toNumber(point.spendingGain);
      return {
        spendingLoss,
        spendingGain,
        spending: spendingLoss + spendingGain,
        net: spendingGain - spendingLoss,
      };
    }

    const spending = toNumber(point.spending);
    const type = String(point.type || "").toLowerCase();
    return {
      spendingLoss: type === "loss" ? spending : 0,
      spendingGain: type === "gain" ? spending : 0,
      spending,
      net: type === "gain" ? spending : -spending,
    };
  }, [point, isAllView]);

  const breakdown = useMemo(() => {
    const labelText = String(breakdownLabel || "").trim() || "Budgets";

    if (!point) {
      return {
        lossSection: null,
        gainSection: null,
        totalLabel: "Total",
        totalAmount: 0,
      };
    }

    if (isAllView) {
      const lossItems = Array.isArray(point.budgetTotalsLoss)
        ? point.budgetTotalsLoss.map((x) => ({
            name: x.budgetName ?? x.name,
            total: toNumber(x.total),
          }))
        : [];

      const gainItems = Array.isArray(point.budgetTotalsGain)
        ? point.budgetTotalsGain.map((x) => ({
            name: x.budgetName ?? x.name,
            total: toNumber(x.total),
          }))
        : [];

      return {
        totalLabel: "Total Spending",
        totalAmount: totals.spendingLoss,
        lossSection: {
          title: `Loss ${labelText}`,
          count: lossItems.length,
          items: lossItems,
          emptyMessage: breakdownEmptyMessage,
        },
        gainSection: {
          title: `Gain ${labelText}`,
          count: gainItems.length,
          items: gainItems,
          emptyMessage: breakdownEmptyMessage,
        },
      };
    }

    const typeKey = String(point.type || "loss").toLowerCase();
    const items = Array.isArray(point.budgetTotals)
      ? point.budgetTotals.map((x) => ({
          name: x.budgetName ?? x.name,
          total: toNumber(x.total),
        }))
      : [];

    const isLoss = typeKey === "loss";

    return {
      totalLabel: isLoss ? "Total Spending" : "Total Gain",
      totalAmount: toNumber(point.spending),
      lossSection: isLoss
        ? {
            title: `Loss ${labelText}`,
            count: items.length,
            items,
            emptyMessage: breakdownEmptyMessage,
          }
        : null,
      gainSection: !isLoss
        ? {
            title: `Gain ${labelText}`,
            count: items.length,
            items,
            emptyMessage: breakdownEmptyMessage,
          }
        : null,
    };
  }, [
    point,
    isAllView,
    totals.spendingLoss,
    breakdownLabel,
    breakdownEmptyMessage,
  ]);

  const expenses = useMemo(() => {
    if (!point) return { loss: [], gain: [], all: [] };

    if (isAllView) {
      const loss = (
        Array.isArray(point.expensesLoss) ? point.expensesLoss : []
      ).map((e) => normalizeExpenseForList(e, "loss", breakdownItemLabel));
      const gain = (
        Array.isArray(point.expensesGain) ? point.expensesGain : []
      ).map((e) => normalizeExpenseForList(e, "gain", breakdownItemLabel));

      const all = [...loss, ...gain].sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return db - da;
      });

      return { loss, gain, all };
    }

    const typeKey = String(point.type || "loss").toLowerCase();
    const list = (Array.isArray(point.expenses) ? point.expenses : []).map(
      (e) => normalizeExpenseForList(e, typeKey, breakdownItemLabel)
    );

    return {
      loss: typeKey === "loss" ? list : [],
      gain: typeKey === "gain" ? list : [],
      all: list,
    };
  }, [point, isAllView, breakdownItemLabel]);

  const activeExpenses = useMemo(() => {
    if (!isAllView) return expenses.all;

    const key = String(activeListType || "all").toLowerCase();
    if (key === "loss") return expenses.loss;
    if (key === "gain") return expenses.gain;
    return expenses.all;
  }, [activeListType, expenses.all, expenses.gain, expenses.loss, isAllView]);

  const totalCount = activeExpenses.length;
  const shouldPaginate = totalCount > rowsPerPage;
  const useScroll = rowsPerPage > BASE_VISIBLE_ROWS;
  const showListControls = totalCount > BASE_VISIBLE_ROWS;

  const listHeightPx = useMemo(() => {
    const visibleRowCount = useScroll
      ? BASE_VISIBLE_ROWS
      : Math.min(BASE_VISIBLE_ROWS, Math.max(1, totalCount));

    return (
      visibleRowCount * cardHeight +
      Math.max(0, visibleRowCount - 1) * listGapPx
    );
  }, [cardHeight, listGapPx, totalCount, useScroll]);

  useEffect(() => {
    setPage(0);
  }, [point, rowsPerPage]);

  useEffect(() => {
    setPage((p) => {
      const nextPageCount = Math.max(1, Math.ceil(totalCount / rowsPerPage));
      return Math.min(p, nextPageCount - 1);
    });
  }, [totalCount, rowsPerPage]);

  const pagedExpenses = useMemo(() => {
    if (!shouldPaginate) return activeExpenses;
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return activeExpenses.slice(start, end);
  }, [activeExpenses, page, rowsPerPage, shouldPaginate]);

  const pageCount = Math.max(1, Math.ceil(totalCount / rowsPerPage));

  const rangeText = useMemo(() => {
    if (totalCount === 0) return "0–0 of 0";
    const start = page * rowsPerPage + 1;
    const end = Math.min(totalCount, (page + 1) * rowsPerPage);
    return `${start}–${end} of ${totalCount}`;
  }, [page, rowsPerPage, totalCount]);

  const listHeader = useMemo(() => {
    const label = String(breakdownLabel || "").trim() || "Breakdown";
    if (!isAllView) return "Transactions";
    const key = String(activeListType || "all").toLowerCase();
    if (key === "loss") return "Transactions";
    if (key === "gain") return "Transactions";
    return `Transactions (${label})`;
  }, [activeListType, breakdownLabel, isAllView]);

  const getCopyText = useCallback(
    () => buildTsvForClipboard({ rows: activeExpenses }),
    [activeExpenses]
  );

  const getExportText = useCallback(
    () => buildCsv({ rows: activeExpenses }),
    [activeExpenses]
  );

  const getExportFilename = useCallback(() => {
    const safeDate = String(dateLabel || "day").replace(/[^a-z0-9-_ ]/gi, "_");
    const key = String(activeListType || "all").toLowerCase();
    const suffix = key === "loss" || key === "gain" ? `-${key}` : "";
    return `daily-spending-${safeDate}${suffix}.csv`;
  }, [activeListType, dateLabel]);

  const canPrev = page > 0;
  const canNext = page < pageCount - 1;

  const onPrevPage = useCallback(() => {
    setPage((p) => Math.max(0, p - 1));
  }, []);

  const onNextPage = useCallback(() => {
    setPage((p) => Math.min(pageCount - 1, p + 1));
  }, [pageCount]);

  const onRowsPerPageChange = useCallback((value) => {
    const next = Number(value);
    setRowsPerPage(Number.isFinite(next) ? next : 5);
    setPage(0);
  }, []);

  const showScrollHint = showListControls && shouldPaginate && useScroll;

  return {
    drawerTitle,
    dateLabel,
    isAllView,
    totals,
    breakdown,
    formatMoney,
    listHeader,
    expenses,
    pagedExpenses,
    listHeightPx,
    listState: {
      page,
      rowsPerPage,
      rowsPerPageOptions: ROWS_PER_PAGE_OPTIONS,
      rangeText,
      shouldPaginate,
      useScroll,
      showListControls,
      canPrev,
      canNext,
      showScrollHint,
    },
    actions: {
      onPrevPage,
      onNextPage,
      onRowsPerPageChange,
    },
    copyExport: {
      getCopyText,
      getExportText,
      getExportFilename,
    },
  };
}
