import React, { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import {
  Box,
  Button,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Typography,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";

const toNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const getExpenseDetails = (expense) => {
  if (!expense) return {};
  return expense.expense || expense.details || expense;
};

const normalizeExpenseForList = (expense, fallbackType, bucketLabel) => {
  const details = getExpenseDetails(expense);
  const rawAmount =
    details.amount ?? details.netAmount ?? expense.amount ?? expense.total ?? 0;

  const type = String(details.type || expense.type || fallbackType || "")
    .toLowerCase()
    .trim();

  const name =
    details.expenseName ||
    expense.expenseName ||
    expense.name ||
    details.name ||
    "Unknown";

  const date = expense.date || details.date || null;

  const bucket =
    expense.bucket || details.bucket || expense.category || bucketLabel || "";

  const category =
    expense.categoryName ||
    details.categoryName ||
    details.category ||
    expense.category ||
    "";

  const paymentMethod =
    expense.paymentMethodName ||
    details.paymentMethodName ||
    details.paymentMethod ||
    expense.paymentMethod ||
    "";

  const comments =
    details.comments ||
    expense.comments ||
    details.description ||
    expense.description ||
    details.note ||
    expense.note ||
    "";

  return {
    id: expense.id ?? details.id ?? expense.expenseId ?? null,
    name,
    amount: Math.abs(toNumber(rawAmount)),
    type,
    date,
    bucket,
    category,
    paymentMethod,
    comments,
    raw: expense,
  };
};

const ArrowIcon = ({ direction = "down", color = "#fff" }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "inline", verticalAlign: "middle", marginBottom: "-2px" }}
  >
    {direction === "up" ? (
      <path
        d="M8 14V2M8 2L3 7M8 2L13 7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : (
      <path
        d="M8 2V14M8 14L3 9M8 14L13 9"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </svg>
);

const clampText = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const buildScrollbarSx = ({ colors, accent } = {}) => {
  const thumb = accent || colors?.primary_accent || "#5b7fff";
  const border = colors?.border_color || "#2a2a2a";
  const track = "transparent";

  return {
    scrollbarGutter: "stable",
    scrollbarWidth: "thin",
    scrollbarColor: `${thumb} ${track}`,
    "&::-webkit-scrollbar": {
      width: 10,
      height: 10,
    },
    "&::-webkit-scrollbar-track": {
      background: track,
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: `${thumb}AA`,
      borderRadius: 999,
      border: `2px solid ${border}33`,
    },
    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: `${thumb}E6`,
    },
  };
};

const BreakdownPanel = ({
  title,
  items,
  accent,
  colors,
  formatMoney,
  emptyMessage,
  maxItems = 5,
}) => {
  const safeItems = Array.isArray(items) ? items : [];
  const nonZeroItems = safeItems.filter(
    (item) => Math.abs(toNumber(item?.total)) > 0
  );
  const pageSize = Math.max(1, Number(maxItems) || 5);
  const [visibleCount, setVisibleCount] = useState(pageSize);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [title, pageSize]);

  const clampedVisibleCount = Math.min(visibleCount, nonZeroItems.length);
  const visible = nonZeroItems.slice(0, clampedVisibleCount);
  const remainingCount = Math.max(0, nonZeroItems.length - clampedVisibleCount);

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: `1px solid ${accent}55`,
        background: colors?.primary_bg,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          py: 1.25,
          borderBottom: `1px solid ${colors?.border_color}`,
          background: `${accent}18`,
        }}
      >
        <Typography sx={{ fontWeight: 900, fontSize: 13, color: accent }}>
          {title}
        </Typography>
        <Box
          sx={{
            minWidth: 26,
            height: 22,
            borderRadius: 999,
            px: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${accent}2B`,
            border: `1px solid ${accent}55`,
            color: colors?.primary_text,
            fontSize: 12,
            fontWeight: 900,
          }}
        >
          {nonZeroItems.length}
        </Box>
      </Box>

      <Box sx={{ px: 1.5, py: 1.25, display: "grid", gap: 1 }}>
        {visible.length === 0 ? (
          <Typography sx={{ opacity: 0.75, fontSize: 12 }}>
            {emptyMessage || "No breakdown available."}
          </Typography>
        ) : (
          visible.map((item, idx) => (
            <Box
              key={`${item?.name ?? "item"}-${idx}`}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: accent,
                    flex: "0 0 auto",
                  }}
                />
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: colors?.primary_text,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={String(item?.name ?? "")}
                >
                  {String(item?.name ?? "")}
                </Typography>
              </Box>

              <Typography sx={{ fontSize: 12, fontWeight: 900, color: accent }}>
                {formatMoney?.(item?.total ?? 0)}
              </Typography>
            </Box>
          ))
        )}

        {nonZeroItems.length > pageSize ? (
          <Box
            sx={{
              mt: 0.25,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Box
              sx={{
                px: 1,
                py: "2px",
                borderRadius: 999,
                border: `1px solid ${accent}33`,
                background: `${accent}14`,
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: 0.2,
                userSelect: "none",
                color: colors?.secondary_text || colors?.primary_text,
              }}
            >
              {clampedVisibleCount}/{nonZeroItems.length}
            </Box>

            {remainingCount > 0 ? (
              <Button
                size="small"
                variant="text"
                onClick={() =>
                  setVisibleCount((count) =>
                    Math.min(nonZeroItems.length, count + pageSize)
                  )
                }
                sx={{
                  minWidth: 0,
                  px: 1,
                  py: 0.25,
                  borderRadius: 999,
                  textTransform: "none",
                  fontSize: 12,
                  fontWeight: 900,
                  color: colors?.secondary_text || colors?.primary_text,
                  background: `${accent}10`,
                  border: `1px solid ${accent}33`,
                  "&:hover": {
                    background: `${accent}1C`,
                    border: `1px solid ${accent}55`,
                  },
                }}
              >
                Show more
                <Box component="span" sx={{ ml: 0.75, opacity: 0.9 }}>
                  (+{remainingCount})
                </Box>
              </Button>
            ) : (
              <Button
                size="small"
                variant="text"
                onClick={() => setVisibleCount(pageSize)}
                sx={{
                  minWidth: 0,
                  px: 1,
                  py: 0.25,
                  borderRadius: 999,
                  textTransform: "none",
                  fontSize: 12,
                  fontWeight: 900,
                  color: colors?.secondary_text || colors?.primary_text,
                  background: `${accent}08`,
                  border: `1px solid ${accent}22`,
                  "&:hover": {
                    background: `${accent}12`,
                    border: `1px solid ${accent}44`,
                  },
                }}
              >
                Show less
              </Button>
            )}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

const ExpenseCard = ({
  expense,
  colors,
  dateFormat,
  currencySymbol,
  locale,
  height = 124,
}) => {
  const type = String(expense?.type || "loss").toLowerCase();
  const isGain = !(type === "outflow" || type === "loss");
  const amountColor = isGain ? "#06d6a0" : "#ff4d4f";
  const dateValue = (() => {
    const dt = expense?.date;
    if (!dt) return "";
    const parsed = dayjs(dt);
    return parsed.isValid() ? parsed.format(dateFormat) : "";
  })();

  const primaryLeft = String(expense?.category || "").trim();
  const primaryRight = String(expense?.paymentMethod || "").trim();
  const comments = String(expense?.comments || "").trim();

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: `1px solid ${colors?.border_color}`,
        background: colors?.primary_bg,
        p: 1.25,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        height,
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          borderBottom: `1px solid ${colors?.border_color}`,
          pb: 0.75,
        }}
      >
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 900,
            color: colors?.primary_text,
            minWidth: 0,
            ...clampText,
          }}
          title={expense?.name}
        >
          {expense?.name}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            flex: "0 0 auto",
          }}
        >
          <ArrowIcon direction={isGain ? "up" : "down"} color={amountColor} />
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 900,
              color: amountColor,
              whiteSpace: "nowrap",
            }}
          >
            {currencySymbol}
            {toNumber(expense?.amount).toLocaleString(locale || undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Typography sx={{ fontSize: 11, fontWeight: 800, opacity: 0.8 }}>
          {dateValue}
        </Typography>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 800,
            color: isGain ? "#06d6a0" : "#ff4d4f",
            textTransform: "uppercase",
            letterSpacing: 0.4,
          }}
        >
          {isGain ? "GAIN" : "LOSS"}
        </Typography>
      </Box>

      {(primaryLeft || primaryRight) && (
        <Box sx={{ display: "flex", gap: 1.25, color: colors?.secondary_text }}>
          {primaryLeft ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                minWidth: 0,
                flex: 1,
              }}
            >
              <LocalOfferIcon
                sx={{ fontSize: 14, color: colors?.primary_accent }}
              />
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={primaryLeft}
              >
                {primaryLeft}
              </Typography>
            </Box>
          ) : null}

          {primaryRight ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                minWidth: 0,
                flex: 1,
              }}
            >
              <AccountBalanceWalletIcon
                sx={{
                  fontSize: 14,
                  color: colors?.secondary_accent || colors?.primary_accent,
                }}
              />
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={primaryRight}
              >
                {primaryRight}
              </Typography>
            </Box>
          ) : null}
        </Box>
      )}

      <Box
        sx={{
          borderTop: `1px solid ${colors?.border_color}`,
          pt: 0.75,
          display: "flex",
          gap: 0.75,
          color: colors?.secondary_text,
          alignItems: "flex-start",
        }}
      >
        <ChatBubbleOutlineIcon sx={{ fontSize: 14, mt: "2px" }} />
        <Typography
          sx={{
            fontSize: 11,
            lineHeight: 1.4,
            opacity: 0.9,
            ...clampText,
          }}
          title={comments}
        >
          {comments || "No comments"}
        </Typography>
      </Box>
    </Box>
  );
};

const formatDateLabel = (point, locale) => {
  const dateObj = point?.dateObj;
  if (dateObj instanceof Date && !Number.isNaN(dateObj.getTime())) {
    return dateObj.toLocaleDateString(locale || undefined, {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  }
  return point?.date || point?.xLabel || "";
};

const buildCsv = ({ dateLabel, rows }) => {
  const escape = (value) => {
    const str = String(value ?? "");
    if (/[\n\r\t,\"]/g.test(str)) {
      return `"${str.replace(/\"/g, '""')}"`;
    }
    return str;
  };

  const header = ["date", "type", "name", "bucket", "amount"].join(",");
  const lines = rows.map((row) =>
    [
      escape(dateLabel),
      escape(row.type),
      escape(row.name),
      escape(row.bucket),
      escape(row.amount),
    ].join(",")
  );

  return [header, ...lines].join("\n");
};

const downloadTextFile = (filename, content) => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const DailySpendingDrilldownDrawer = ({
  open,
  onClose,
  point,
  breakdownLabel,
  breakdownEmptyMessage,
  breakdownItemLabel,
}) => {
  const { mode, colors } = useTheme();
  const settings = useUserSettings();
  const currencySymbol = settings.getCurrency().symbol;
  const locale = settings.language || "en";
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:1024px)");

  const isAllView =
    typeof point?.spendingLoss !== "undefined" ||
    typeof point?.spendingGain !== "undefined";

  const dateFormat = settings.dateFormat || "DD/MM/YYYY";
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const cardHeight = isMobile ? 148 : 124;
  const listGapPx = 8;

  const dateLabel = useMemo(
    () => formatDateLabel(point, locale),
    [point, locale]
  );

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

  const totalCount = expenses.all.length;
  const BASE_VISIBLE_ROWS = 5;
  const shouldPaginate = totalCount > rowsPerPage;
  const useScroll = rowsPerPage > BASE_VISIBLE_ROWS;

  const listHeightPx = useMemo(() => {
    const visibleRowCount = BASE_VISIBLE_ROWS;
    return (
      visibleRowCount * cardHeight +
      Math.max(0, visibleRowCount - 1) * listGapPx
    );
  }, [BASE_VISIBLE_ROWS, cardHeight, listGapPx]);

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
    if (!shouldPaginate) return expenses.all;
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return expenses.all.slice(start, end);
  }, [expenses.all, page, rowsPerPage, shouldPaginate]);

  const pageCount = Math.max(1, Math.ceil(totalCount / rowsPerPage));
  const rangeText = useMemo(() => {
    if (totalCount === 0) return "0–0 of 0";
    const start = page * rowsPerPage + 1;
    const end = Math.min(totalCount, (page + 1) * rowsPerPage);
    return `${start}–${end} of ${totalCount}`;
  }, [page, rowsPerPage, totalCount]);

  const handleCopySummary = useCallback(async () => {
    const lines = [];
    lines.push(`Date: ${dateLabel}`);

    if (isAllView) {
      lines.push(`Total Spending: ${formatMoney(totals.spendingLoss)}`);
      lines.push(`Total Gain: ${formatMoney(totals.spendingGain)}`);
      lines.push(
        `Net: ${totals.net >= 0 ? "+" : "-"}${formatMoney(
          Math.abs(totals.net)
        )}`
      );
    } else {
      lines.push(
        `${breakdown.totalLabel}: ${formatMoney(breakdown.totalAmount)}`
      );
    }

    const topRows = expenses.all.slice(0, 12);
    if (topRows.length > 0) {
      lines.push("");
      lines.push("Transactions:");
      topRows.forEach((row) => {
        const sign = row.type === "gain" ? "+" : "-";
        const bucket = row.bucket ? ` (${row.bucket})` : "";
        lines.push(`${sign}${formatMoney(row.amount)} - ${row.name}${bucket}`);
      });
      if (expenses.all.length > topRows.length) {
        lines.push(`... +${expenses.all.length - topRows.length} more`);
      }
    }

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
    } catch (e) {
      // ignore clipboard errors (browser permissions)
    }
  }, [dateLabel, isAllView, totals, breakdown, expenses, formatMoney]);

  const handleExportCsv = useCallback(() => {
    const csv = buildCsv({ dateLabel, rows: expenses.all });
    const safeDate = String(dateLabel || "day").replace(/[^a-z0-9-_ ]/gi, "_");
    downloadTextFile(`daily-spending-${safeDate}.csv`, csv);
  }, [dateLabel, expenses.all]);

  const listHeader = useMemo(() => {
    const label = String(breakdownLabel || "").trim() || "Breakdown";
    if (!isAllView) return "Transactions";
    return `Transactions (${label})`;
  }, [breakdownLabel, isAllView]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isMobile ? "100%" : 440,
          background: colors?.secondary_bg || "#0b0b10",
          color: colors?.primary_text || "#fff",
          overflowX: "hidden",
          overflowY: "auto",
          ...buildScrollbarSx({ colors }),
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", p: 2, gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 900, fontSize: 14 }}>
            Day details
          </Typography>
          <Typography sx={{ opacity: 0.75, fontSize: 12 }}>
            {dateLabel}
          </Typography>
        </Box>

        <Button
          size="small"
          variant="outlined"
          onClick={handleCopySummary}
          startIcon={<ContentCopyIcon />}
          sx={{
            borderColor: colors?.border_color,
            color: colors?.primary_text,
            textTransform: "none",
          }}
        >
          Copy
        </Button>

        <Button
          size="small"
          variant="outlined"
          onClick={handleExportCsv}
          startIcon={<DownloadIcon />}
          sx={{
            borderColor: colors?.border_color,
            color: colors?.primary_text,
            textTransform: "none",
          }}
        >
          Export
        </Button>

        <IconButton onClick={onClose} sx={{ color: colors?.primary_text }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ p: 2, display: "grid", gap: 1.25 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            border: `1px solid ${colors?.border_color}`,
            borderRadius: 2,
            p: 1.25,
            background: colors?.primary_bg,
          }}
        >
          <Typography sx={{ fontSize: 12, fontWeight: 900, opacity: 0.85 }}>
            {isAllView ? "Net" : breakdown.totalLabel}
          </Typography>
          {isAllView ? (
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 900,
                color: totals.net >= 0 ? "#00d4c0" : "#ff5252",
              }}
            >
              {totals.net >= 0 ? "+" : "-"}
              {formatMoney(Math.abs(totals.net))}
            </Typography>
          ) : (
            <Typography
              sx={{ fontSize: 14, fontWeight: 900, color: "#fadb14" }}
            >
              {formatMoney(breakdown.totalAmount)}
            </Typography>
          )}
        </Box>

        {isAllView ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1,
            }}
          >
            <Box
              sx={{
                border: `1px solid ${colors?.border_color}`,
                borderRadius: 2,
                p: 1.25,
                background: colors?.primary_bg,
              }}
            >
              <Typography sx={{ fontSize: 11, fontWeight: 900, opacity: 0.8 }}>
                Total Spending
              </Typography>
              <Typography
                sx={{ fontSize: 13, fontWeight: 900, color: "#ff5252" }}
              >
                {formatMoney(totals.spendingLoss)}
              </Typography>
            </Box>
            <Box
              sx={{
                border: `1px solid ${colors?.border_color}`,
                borderRadius: 2,
                p: 1.25,
                background: colors?.primary_bg,
              }}
            >
              <Typography sx={{ fontSize: 11, fontWeight: 900, opacity: 0.8 }}>
                Total Gain
              </Typography>
              <Typography
                sx={{ fontSize: 13, fontWeight: 900, color: "#00d4c0" }}
              >
                {formatMoney(totals.spendingGain)}
              </Typography>
            </Box>
          </Box>
        ) : null}

        {(breakdown.lossSection || breakdown.gainSection) && (
          <Box sx={{ display: "grid", gap: 1.25 }}>
            {breakdown.lossSection ? (
              <BreakdownPanel
                title={breakdown.lossSection.title}
                items={breakdown.lossSection.items}
                accent="#ff5252"
                colors={colors}
                formatMoney={formatMoney}
                emptyMessage={breakdown.lossSection.emptyMessage}
                maxItems={5}
              />
            ) : null}

            {breakdown.gainSection ? (
              <BreakdownPanel
                title={breakdown.gainSection.title}
                items={breakdown.gainSection.items}
                accent="#00d4c0"
                colors={colors}
                formatMoney={formatMoney}
                emptyMessage={breakdown.gainSection.emptyMessage}
                maxItems={5}
              />
            ) : null}
          </Box>
        )}
      </Box>

      <Divider sx={{ borderColor: colors?.border_color }} />

      <Box sx={{ px: 2, pb: 2 }}>
        <Typography sx={{ fontWeight: 900, fontSize: 13, mb: 1 }}>
          {listHeader}
        </Typography>

        {expenses.all.length === 0 ? (
          <Typography sx={{ opacity: 0.75, fontSize: 12 }}>
            No transactions found.
          </Typography>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: `${listGapPx}px`,
                height: `${listHeightPx}px`,
                justifyContent: "flex-start",
                overflowY: useScroll ? "scroll" : "hidden",
                overflowX: "hidden",
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
                touchAction: "pan-y",
                pr: useScroll ? 0.5 : 0,
                ...(useScroll ? buildScrollbarSx({ colors }) : null),
              }}
            >
              {pagedExpenses.map((exp, idx) => (
                <ExpenseCard
                  key={exp.id ?? `${exp.name}-${idx}`}
                  expense={exp}
                  colors={colors}
                  dateFormat={dateFormat}
                  currencySymbol={currencySymbol}
                  locale={locale}
                  height={cardHeight}
                />
              ))}
            </Box>

            <Box sx={{ mt: 1, width: "100%", overflowX: "hidden" }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr",
                  alignItems: "center",
                  gap: 1,
                  overflowX: "hidden",
                }}
              >
                <Box />

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "nowrap",
                    justifyContent: "center",
                  }}
                >
                  {shouldPaginate ? (
                    <IconButton
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page <= 0}
                      size="small"
                      sx={{
                        border: `1px solid ${colors?.border_color}`,
                        borderRadius: 2,
                        color: colors?.primary_text,
                        "&.Mui-disabled": { opacity: 0.35 },
                      }}
                    >
                      <NavigateBeforeIcon fontSize="small" />
                    </IconButton>
                  ) : null}

                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: colors?.secondary_text || colors?.primary_text,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {rangeText}
                  </Typography>

                  {shouldPaginate ? (
                    <IconButton
                      onClick={() =>
                        setPage((p) => Math.min(pageCount - 1, p + 1))
                      }
                      disabled={page >= pageCount - 1}
                      size="small"
                      sx={{
                        border: `1px solid ${colors?.border_color}`,
                        borderRadius: 2,
                        color: colors?.primary_text,
                        "&.Mui-disabled": { opacity: 0.35 },
                      }}
                    >
                      <NavigateNextIcon fontSize="small" />
                    </IconButton>
                  ) : null}
                </Box>

                <Box
                  sx={{
                    justifySelf: "end",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <FormControl size="small" sx={{ minWidth: 72 }}>
                    <Select
                      value={rowsPerPage}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setRowsPerPage(Number.isFinite(next) ? next : 5);
                        setPage(0);
                      }}
                      renderValue={(v) => String(v)}
                      sx={{
                        color: colors?.primary_text,
                        borderRadius: 2,
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: colors?.border_color,
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: `${
                            colors?.primary_accent || "#5b7fff"
                          }66`,
                        },
                        "& .MuiSvgIcon-root": {
                          color: colors?.primary_text,
                        },
                      }}
                    >
                      {[5, 10, 20, 50, 100].map((n) => (
                        <MenuItem key={n} value={n}>
                          {n}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Box>

            {shouldPaginate && useScroll ? (
              <Box sx={{ mt: 1, width: "100%", overflowX: "hidden" }}>
                <Typography
                  sx={{
                    opacity: 0.7,
                    fontSize: 12,
                    textAlign: "center",
                  }}
                >
                  Scroll inside the list to view more
                </Typography>
              </Box>
            ) : null}
          </>
        )}
      </Box>
    </Drawer>
  );
};

DailySpendingDrilldownDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  point: PropTypes.object,
  breakdownLabel: PropTypes.string,
  breakdownEmptyMessage: PropTypes.string,
  breakdownItemLabel: PropTypes.string,
};

export default DailySpendingDrilldownDrawer;
