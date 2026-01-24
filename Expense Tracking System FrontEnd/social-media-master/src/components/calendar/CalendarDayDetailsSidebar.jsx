import React, { useMemo } from "react";
import dayjs from "dayjs";
import { Box, Typography, IconButton, Divider, Chip } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import { useTheme as useAppTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
import { formatAmount } from "../../utils/formatAmount";

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function extractExpenseLike(item) {
  // Cashflow endpoints sometimes return { expense: {...}, type, amount }.
  // Day endpoints sometimes return the expense directly.
  return item?.expense || item;
}

function classifyFlowType(t) {
  const type = (t || "").toLowerCase();
  if (type === "gain" || type === "inflow") return "gain";
  if (type === "loss" || type === "outflow") return "loss";
  return "neutral";
}

/**
 * Reusable side panel for calendar day details.
 * Designed for category/payment-method calendars now, but can be reused for
 * expenses/bills calendar split-view later.
 */
const CalendarDayDetailsSidebar = ({
  dateStr,
  items,
  onClose,
  headerTitle = "Calendar View",
  renderLeadingIcon,
}) => {
  const { colors } = useAppTheme();
  const settings = useUserSettings();
  const currencySymbol = settings.getCurrency().symbol;

  const dateObj = useMemo(() => dayjs(dateStr), [dateStr]);
  const list = useMemo(() => safeArray(items), [items]);

  const totals = useMemo(() => {
    let spending = 0;
    let income = 0;
    list.forEach((it) => {
      const type = classifyFlowType(it?.type || it?.expense?.type);
      const exp = extractExpenseLike(it);
      const amount = Number(it?.amount ?? exp?.amount ?? 0) || 0;
      if (type === "loss") spending += Math.abs(amount);
      if (type === "gain") income += Math.abs(amount);
    });
    return { spending, income };
  }, [list]);

  const dateHeader = useMemo(() => {
    if (!dateStr) return "";
    return dateObj.isValid()
      ? dateObj.format("dddd, MMMM D, YYYY")
      : String(dateStr);
  }, [dateObj, dateStr]);

  return (
    <Box
      sx={{
        height: "100%",
        backgroundColor: colors.secondary_bg,
        borderRadius: 2,
        border: `1px solid ${colors.border}`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          py: 1.25,
          backgroundColor: colors.primary_bg,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography
            variant="caption"
            sx={{ color: colors.placeholder_text, fontWeight: 700 }}
          >
            {headerTitle}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: colors.primary_text,
              fontWeight: 800,
              lineHeight: 1.2,
            }}
          >
            {dateHeader}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton
            size="small"
            aria-label="More options"
            sx={{ color: colors.primary_text }}
          >
            <MoreHorizRoundedIcon />
          </IconButton>
          <IconButton
            size="small"
            aria-label="Close details"
            onClick={onClose}
            sx={{
              color: colors.primary_text,
              backgroundColor: colors.secondary_bg,
              border: `1px solid ${colors.border}`,
              "&:hover": { backgroundColor: colors.hover_bg },
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Totals */}
      <Box sx={{ px: 1.5, py: 1.25 }}>
        <Box
          sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}
        >
          <Typography variant="body2" sx={{ color: colors.secondary_text }}>
            Total Spending
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Typography
              variant="body2"
              sx={{ color: "#ff4d4f", fontWeight: 800 }}
            >
              {formatAmount(totals.spending, {
                currencySymbol,
                maximumFractionDigits: 0,
              })}
            </Typography>
            <ArrowDownwardRoundedIcon sx={{ color: "#ff4d4f", fontSize: 16 }} />
          </Box>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" sx={{ color: colors.secondary_text }}>
            Total Income
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Typography
              variant="body2"
              sx={{ color: "#06d6a0", fontWeight: 800 }}
            >
              {formatAmount(totals.income, {
                currencySymbol,
                maximumFractionDigits: 0,
              })}
            </Typography>
            <ArrowUpwardRoundedIcon sx={{ color: "#06d6a0", fontSize: 16 }} />
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: colors.border }} />

      {/* List */}
      <Box
        sx={{
          px: 1.5,
          py: 1.25,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          flex: 1,
        }}
      >
        {list.length === 0 ? (
          <Typography variant="body2" sx={{ color: colors.placeholder_text }}>
            No transactions for this day.
          </Typography>
        ) : (
          list.map((raw, idx) => {
            const exp = extractExpenseLike(raw);
            const cls = classifyFlowType(raw?.type || exp?.type);
            const isLoss = cls === "loss";
            const amount = Number(raw?.amount ?? exp?.amount ?? 0) || 0;
            const title =
              exp?.expenseName ||
              exp?.name ||
              exp?.title ||
              raw?.title ||
              "Transaction";

            const categoryName =
              exp?.categoryName || exp?.category?.name || exp?.category || null;
            const categoryColor =
              exp?.categoryColor || exp?.category?.color || "#14b8a6";
            const categoryIconKey =
              exp?.categoryIcon || exp?.category?.icon || categoryName;

            const paymentMethodName =
              exp?.paymentMethodName ||
              exp?.paymentMethod?.name ||
              exp?.paymentMethod ||
              null;
            const paymentMethodColor =
              exp?.paymentMethodColor || exp?.paymentMethod?.color || "#14b8a6";
            const paymentMethodIconKey =
              exp?.paymentMethodIcon ||
              exp?.paymentMethod?.icon ||
              paymentMethodName;

            const timeText = (() => {
              const d = dayjs(exp?.date || raw?.date);
              if (!d.isValid()) return null;
              const rawDate = exp?.date || raw?.date;
              const hasTime =
                typeof rawDate === "string" &&
                (rawDate.includes("T") || rawDate.includes(":"));
              return hasTime ? d.format("h:mm A") : null;
            })();

            return (
              <Box
                key={`${exp?.id || raw?.id || idx}`}
                sx={{
                  borderRadius: 2,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.tertiary_bg,
                  px: 1.25,
                  py: 1.1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    {typeof renderLeadingIcon === "function" && (
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: 1.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: colors.primary_bg,
                          border: `1px solid ${colors.border}`,
                          flex: "0 0 auto",
                        }}
                      >
                        {renderLeadingIcon(raw, {
                          category: {
                            name: categoryName,
                            iconKey: categoryIconKey,
                            color: categoryColor,
                          },
                          paymentMethod: {
                            name: paymentMethodName,
                            iconKey: paymentMethodIconKey,
                            color: paymentMethodColor,
                          },
                        })}
                      </Box>
                    )}

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: colors.primary_text,
                          fontWeight: 800,
                          lineHeight: 1.25,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {title}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.75,
                          mt: 0.6,
                        }}
                      >
                        {categoryName && (
                          <Chip
                            size="small"
                            label={String(categoryName).toUpperCase()}
                            sx={{
                              height: 22,
                              fontSize: 11,
                              fontWeight: 800,
                              color: colors.primary_text,
                              backgroundColor: `${categoryColor}22`,
                              border: `1px solid ${categoryColor}55`,
                            }}
                          />
                        )}
                        {paymentMethodName && (
                          <Chip
                            size="small"
                            label={String(paymentMethodName).toUpperCase()}
                            sx={{
                              height: 22,
                              fontSize: 11,
                              fontWeight: 800,
                              color: colors.primary_text,
                              backgroundColor: `${paymentMethodColor}22`,
                              border: `1px solid ${paymentMethodColor}55`,
                            }}
                          />
                        )}
                        {timeText && (
                          <Chip
                            size="small"
                            icon={
                              <AccessTimeRoundedIcon
                                sx={{ color: colors.placeholder_text }}
                              />
                            }
                            label={timeText}
                            sx={{
                              height: 22,
                              fontSize: 11,
                              fontWeight: 800,
                              color: colors.primary_text,
                              backgroundColor: colors.primary_bg,
                              border: `1px solid ${colors.border}`,
                              ".MuiChip-icon": { ml: 0.4 },
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>

                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: isLoss ? "#ff4d4f" : "#06d6a0",
                      fontWeight: 900,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatAmount(Math.abs(amount), {
                      currencySymbol,
                      maximumFractionDigits: 0,
                    })}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
};

export default CalendarDayDetailsSidebar;
