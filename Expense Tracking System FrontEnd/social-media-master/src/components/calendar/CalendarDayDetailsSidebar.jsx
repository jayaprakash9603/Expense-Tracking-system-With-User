import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Box,
  Typography,
  IconButton,
  Divider,
  Chip,
  Select,
  MenuItem,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DatePickerPopover from "../common/DatePickerPopover";
import NoDataPlaceholder from "../NoDataPlaceholder";
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
  onNavigateDate,
  onItemClick,
  availableDates,
}) => {
  const { colors } = useAppTheme();
  const settings = useUserSettings();
  const currencySymbol = settings.getCurrency().symbol;

  const displayDateFormat = "ddd, MMM D, YYYY";

  const [datePickerAnchor, setDatePickerAnchor] = useState(null);
  const [selectedPickerDate, setSelectedPickerDate] = useState(null);

  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(0);

  const dateObj = useMemo(() => dayjs(dateStr), [dateStr]);
  const list = useMemo(() => safeArray(items), [items]);

  const sortedAvailableDates = useMemo(() => {
    const raw = safeArray(availableDates)
      .filter((d) => typeof d === "string" && d.length >= 8)
      .filter((d) => dayjs(d, "YYYY-MM-DD", true).isValid());
    return Array.from(new Set(raw)).sort();
  }, [availableDates]);

  const minAvailableDate = useMemo(() => {
    if (sortedAvailableDates.length === 0) return null;
    return dayjs(sortedAvailableDates[0], "YYYY-MM-DD");
  }, [sortedAvailableDates]);

  const maxAvailableDate = useMemo(() => {
    if (sortedAvailableDates.length === 0) return null;
    return dayjs(
      sortedAvailableDates[sortedAvailableDates.length - 1],
      "YYYY-MM-DD",
    );
  }, [sortedAvailableDates]);

  useEffect(() => {
    setPage(0);
  }, [dateStr, pageSize]);

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
      ? dateObj.format(displayDateFormat)
      : String(dateStr);
  }, [dateObj, dateStr]);

  const handleDateChipClick = (event) => {
    setDatePickerAnchor(event.currentTarget);
    setSelectedPickerDate(dateObj.isValid() ? dateObj : dayjs());
  };

  const handleDatePickerClose = () => {
    setDatePickerAnchor(null);
  };

  const handlePickedDateChange = (newValue) => {
    if (!newValue) return;
    if (!dayjs(newValue).isValid()) return;
    const next = dayjs(newValue);
    setSelectedPickerDate(next);
    onNavigateDate?.(next.format("YYYY-MM-DD"));
    setDatePickerAnchor(null);
  };

  const getPrevAvailableDate = () => {
    if (!dateObj.isValid() || sortedAvailableDates.length === 0) return null;
    const currentKey = dateObj.format("YYYY-MM-DD");
    const idx = sortedAvailableDates.indexOf(currentKey);
    if (idx > 0) return sortedAvailableDates[idx - 1];
    if (idx === 0) return null;

    // If currentKey not present, find insertion point and step back.
    let lo = 0;
    let hi = sortedAvailableDates.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (sortedAvailableDates[mid] < currentKey) lo = mid + 1;
      else hi = mid;
    }
    const prevIdx = lo - 1;
    return prevIdx >= 0 ? sortedAvailableDates[prevIdx] : null;
  };

  const getNextAvailableDate = () => {
    if (!dateObj.isValid() || sortedAvailableDates.length === 0) return null;
    const currentKey = dateObj.format("YYYY-MM-DD");
    const idx = sortedAvailableDates.indexOf(currentKey);
    if (idx >= 0 && idx < sortedAvailableDates.length - 1)
      return sortedAvailableDates[idx + 1];
    if (idx === sortedAvailableDates.length - 1) return null;

    // If currentKey not present, find insertion point and take that.
    let lo = 0;
    let hi = sortedAvailableDates.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (sortedAvailableDates[mid] < currentKey) lo = mid + 1;
      else hi = mid;
    }
    return lo < sortedAvailableDates.length ? sortedAvailableDates[lo] : null;
  };

  const handlePrevDate = () => {
    const prev = getPrevAvailableDate();
    if (!prev) return;
    onNavigateDate?.(prev);
  };

  const handleNextDate = () => {
    const next = getNextAvailableDate();
    if (!next) return;
    onNavigateDate?.(next);
  };

  const totalCount = list.length;
  const maxPage = Math.max(0, Math.ceil(totalCount / pageSize) - 1);
  const safePage = Math.min(page, maxPage);
  const startIndex = totalCount === 0 ? 0 : safePage * pageSize;
  const endIndex = Math.min(totalCount, startIndex + pageSize);
  const pagedItems = useMemo(
    () => list.slice(startIndex, endIndex),
    [list, startIndex, endIndex],
  );

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
          flexDirection: "column",
          alignItems: "stretch",
          px: 1.5,
          pt: 1.25,
          pb: 1.5,
          backgroundColor: colors.primary_bg,
          borderBottom: `1px solid ${colors.border}`,
          position: "relative",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            mb: 1.25,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: colors.placeholder_text,
              fontWeight: 700,
            }}
          >
            {headerTitle}
          </Typography>

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

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "36px 1fr 36px",
            alignItems: "center",
            width: "100%",
            columnGap: 0.75,
            pr: 0,
          }}
        >
          <IconButton
            size="small"
            aria-label="Previous day"
            onClick={handlePrevDate}
            disabled={!getPrevAvailableDate()}
            sx={{
              color: colors.primary_text,
              backgroundColor: colors.secondary_bg,
              border: `1px solid ${colors.border}`,
              "&:hover": { backgroundColor: colors.hover_bg },
              "&.Mui-disabled": { opacity: 0.4 },
              width: 36,
              height: 36,
              justifySelf: "start",
            }}
          >
            <ChevronLeftRoundedIcon fontSize="small" />
          </IconButton>

          <Box
            role="button"
            tabIndex={0}
            onClick={handleDateChipClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleDateChipClick(e);
              }
            }}
            title="Select date"
            sx={{
              justifySelf: "center",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "fit-content",
              maxWidth: "100%",
              px: 2,
              py: 0.75,
              borderRadius: 999,
              cursor: "pointer",
              userSelect: "none",
              background: `${colors.primary_accent || "#14b8a6"}15`,
              border: `1px solid ${(colors.primary_accent || "#14b8a6") + "40"}`,
              transition: "all 0.2s ease",
              outline: "none",
              "&:hover": {
                background: `${colors.primary_accent || "#14b8a6"}25`,
              },
              "&:focus-visible": {
                boxShadow: `0 0 0 3px ${(colors.primary_accent || "#14b8a6") + "30"}`,
              },
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: colors.primary_accent || "#14b8a6",
                fontWeight: 600,
                fontSize: "13px",
                lineHeight: 1.1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {dateHeader}
            </Typography>
          </Box>

          <IconButton
            size="small"
            aria-label="Next day"
            onClick={handleNextDate}
            disabled={!getNextAvailableDate()}
            sx={{
              color: colors.primary_text,
              backgroundColor: colors.secondary_bg,
              border: `1px solid ${colors.border}`,
              "&:hover": { backgroundColor: colors.hover_bg },
              "&.Mui-disabled": { opacity: 0.4 },
              width: 36,
              height: 36,
              justifySelf: "end",
            }}
          >
            <ChevronRightRoundedIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ height: 10 }} />

        <DatePickerPopover
          open={Boolean(datePickerAnchor)}
          anchorEl={datePickerAnchor}
          onClose={handleDatePickerClose}
          value={selectedPickerDate}
          onChange={handlePickedDateChange}
          format={displayDateFormat}
          availableDates={sortedAvailableDates}
          minDate={minAvailableDate}
          maxDate={maxAvailableDate}
        />
      </Box>

      {/* Totals */}
      <Box sx={{ px: 1.5, py: 1.25 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            backgroundColor: colors.primary_bg,
            border: `1px solid ${colors.border}`,
            borderRadius: 2,
            px: 1.25,
            py: 0.9,
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Typography variant="body2" sx={{ color: colors.secondary_text }}>
              Spending
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              <Typography
                variant="body2"
                sx={{ color: "#ff4d4f", fontWeight: 800 }}
              >
                {formatAmount(totals.spending, {
                  currencySymbol,
                  maximumFractionDigits: 0,
                })}
              </Typography>
              <ArrowDownwardRoundedIcon
                sx={{ color: "#ff4d4f", fontSize: 16 }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Typography variant="body2" sx={{ color: colors.secondary_text }}>
              Income
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
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
          pr: 1,
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: colors.secondary_bg,
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: colors.primary_accent,
            borderRadius: "10px",
            "&:hover": {
              opacity: 0.85,
            },
          },
          scrollbarWidth: "thin",
          scrollbarColor: `${colors.primary_accent} ${colors.secondary_bg}`,
        }}
      >
        {pagedItems.length === 0 ? (
          <NoDataPlaceholder
            message="No transactions on this day"
            subMessage="Try selecting another date using the date badge above."
            size="lg"
            fullWidth
          />
        ) : (
          pagedItems.map((raw, idx) => {
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
                  backgroundColor: colors.primary_bg,
                  px: 1.25,
                  py: 1.1,
                  cursor: onItemClick ? "pointer" : "default",
                  transition: "background 160ms ease, transform 160ms ease",
                  "&:hover": onItemClick
                    ? {
                        backgroundColor: colors.hover_bg,
                        transform: "translateY(-1px)",
                      }
                    : undefined,
                }}
                onClick={() => onItemClick?.(exp, raw)}
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
                      display: "flex",
                      alignItems: "center",
                      gap: 0.25,
                    }}
                  >
                    {isLoss ? (
                      <ArrowDownwardRoundedIcon
                        sx={{ color: "#ff4d4f", fontSize: 16 }}
                      />
                    ) : (
                      <ArrowUpwardRoundedIcon
                        sx={{ color: "#06d6a0", fontSize: 16 }}
                      />
                    )}
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

      <Divider sx={{ borderColor: colors.border }} />

      {/* Pagination */}
      <Box
        sx={{
          px: 1.5,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          backgroundColor: colors.primary_bg,
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: colors.secondary_text,
            minWidth: 110,
          }}
        >
          {totalCount === 0
            ? "0 of 0"
            : `${startIndex + 1}-${endIndex} of ${totalCount}`}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.75,
            flex: 1,
          }}
        >
          <IconButton
            size="small"
            aria-label="Previous page"
            disabled={safePage <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            sx={{
              color: colors.primary_text,
              backgroundColor: colors.secondary_bg,
              border: `1px solid ${colors.border}`,
              "&:hover": { backgroundColor: colors.hover_bg },
              "&.Mui-disabled": { opacity: 0.4 },
            }}
          >
            <ChevronLeftRoundedIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            aria-label="Next page"
            disabled={safePage >= maxPage}
            onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
            sx={{
              color: colors.primary_text,
              backgroundColor: colors.secondary_bg,
              border: `1px solid ${colors.border}`,
              "&:hover": { backgroundColor: colors.hover_bg },
              "&.Mui-disabled": { opacity: 0.4 },
            }}
          >
            <ChevronRightRoundedIcon fontSize="small" />
          </IconButton>
        </Box>

        <Select
          size="small"
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value) || 5)}
          sx={{
            height: 30,
            minWidth: 64,
            color: colors.primary_text,
            backgroundColor: colors.secondary_bg,
            borderRadius: 1.5,
            ".MuiOutlinedInput-notchedOutline": {
              borderColor: colors.border,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: colors.primary_accent,
            },
            ".MuiSvgIcon-root": { color: colors.primary_text },
          }}
        >
          {[5, 10, 20].map((n) => (
            <MenuItem key={n} value={n}>
              {n}
            </MenuItem>
          ))}
        </Select>
      </Box>
    </Box>
  );
};

export default CalendarDayDetailsSidebar;
