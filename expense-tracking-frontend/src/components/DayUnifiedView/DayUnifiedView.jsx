import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import FinanceSummaryCard from "../calendar/FinanceSummaryCard";
import DayNavigator from "../calendar/DayNavigator";
import { useTranslation } from "../../hooks/useTranslation";
import ToastNotification from "../../shared/ui/feedback/ToastNotification";
import Modal from "../../shared/ui/overlays/Modal";
import EditIcon from "@mui/icons-material/Edit";
import cardPaymentIconAsset from "../../assests/card-payment.png";
import DeleteIcon from "@mui/icons-material/Delete";
import DayViewSkeleton from "../DayViewSkeleton";
import JumpToTodayButton from "../JumpToTodayButton";
import { useTheme as useAppTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
import { getFinanceCalendarColors } from "../../config/financeColorTokens";
import "./DayUnifiedView.css";

/**
 * Generic unified day view for expenses or bills.
 * Props:
 *  type: 'expense' | 'bill'
 *  dateParam: string (YYYY-MM-DD)
 *  friendId: string | undefined
 *  hasWriteAccess: boolean
 *  loading: boolean
 *  items: array of entries (must have expense or bill-like structure)
 *  fetchAction(date, friendId)
 *  deleteAction(id, friendId)
 *  navigate: react-router navigate function
 *  routes: { calendarBase, dayBase, editBase, createBase }
 *  getEditTargetId(item): id (or Promise resolving to id) for editing (may differ for bills)
 *  getDeleteTargetId(item): id (or Promise resolving to id) for deletion
 *  fetchAfterDelete(date, friendId) (optional)
 *  emptyTitle: string
 */
const DayUnifiedView = ({
  type,
  dateParam,
  friendId,
  hasWriteAccess,
  loading,
  items = [],
  fetchAction,
  deleteAction,
  navigate,
  routes,
  getEditTargetId,
  getDeleteTargetId,
  fetchAfterDelete,
  emptyTitle = "No data!",
}) => {
  const { colors, mode } = useAppTheme();
  const { t } = useTranslation();
  const settings = useUserSettings();
  const financeColors = getFinanceCalendarColors(mode);
  const currencySymbol = settings.getCurrency().symbol;
  const dateFormat = settings.dateFormat || "DD/MM/YYYY";
  const [selectedCardIdx, setSelectedCardIdx] = useState(null);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [toastMessage, setToastMessage] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const currentDay = dayjs(dateParam);

  // Fetch items when date or friend changes.
  // Note: we intentionally DO NOT include fetchAction in deps to avoid infinite loops
  // when parent passes a new inline function each render.
  useEffect(() => {
    if (dateParam) {
      fetchAction(dateParam, friendId || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateParam, friendId]);

  const transactions = useMemo(
    () => (Array.isArray(items) ? items : []),
    [items]
  );

  // Aggregate totals
  const { totalGains, totalLosses } = useMemo(() => {
    let gains = 0,
      losses = 0;
    transactions.forEach((item) => {
      const t = item.type || item.expense?.type;
      const amt = item.expense?.amount || item.amount || 0;
      if (t === "gain" || t === "inflow") gains += amt;
      if (t === "loss" || t === "outflow") losses += amt;
    });
    return { totalGains: gains, totalLosses: losses };
  }, [transactions]);

  function formatAmount(num) {
    if (num === 0) return "0";
    const absNum = Math.abs(num);
    const format = (val, suffix) => {
      const str = val.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      });
      if (str.endsWith(".00")) return str.replace(".00", "") + suffix;
      if (str.endsWith("0")) return str.replace(/\.0$/, "") + suffix;
      return str + suffix;
    };
    if (absNum >= 1e12) return format(num / 1e12, "T");
    if (absNum >= 1e9) return format(num / 1e9, "B");
    if (absNum >= 1e6) return format(num / 1e6, "M");
    if (absNum >= 1e3) return format(num / 1e3, "K");
    return num.toLocaleString();
  }

  const goToDay = (d) => {
    const target = dayjs(d).format("YYYY-MM-DD");
    setSelectedCardIdx(null);
    if (friendId && friendId !== "undefined") {
      navigate(`${routes.dayBase}/${target}/friend/${friendId}`);
    } else {
      navigate(`${routes.dayBase}/${target}`);
    }
  };

  const handlePrevDay = () => goToDay(currentDay.subtract(1, "day"));
  const handleNextDay = () => goToDay(currentDay.add(1, "day"));

  // Jump to today's date
  const handleJumpToToday = () => {
    goToDay(dayjs());
  };

  // Check if currently viewing today's date
  const isViewingToday = useMemo(() => {
    return currentDay.isSame(dayjs(), "day");
  }, [currentDay]);

  const handleEdit = async (item) => {
    if (!getEditTargetId) return;
    let id = getEditTargetId(item);
    // Support async function returning a promise
    if (id && typeof id.then === "function") {
      id = await id;
    }
    if (!id) return;
    if (friendId && friendId !== "undefined") {
      navigate(`${routes.editBase}/${id}/friend/${friendId}`);
    } else {
      navigate(`${routes.editBase}/${id}`);
    }
    setToastMessage("Edit page opened.");
    setToastOpen(true);
  };

  const handleDeleteInit = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    let id = getDeleteTargetId ? getDeleteTargetId(itemToDelete) : null;
    if (id && typeof id.then === "function") {
      id = await id;
    }
    if (!id) return;
    try {
      await deleteAction(id, friendId || "");
      setToastMessage("Deleted successfully.");
      setToastOpen(true);
      setSelectedCardIdx(null);
      if (fetchAfterDelete) {
        await fetchAfterDelete(currentDay.format("YYYY-MM-DD"), friendId || "");
      }
    } catch (e) {
      setToastMessage("Error deleting.");
      setToastOpen(true);
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const addNew = () => {
    const dateQ = currentDay.format("YYYY-MM-DD");
    if (friendId && friendId !== "undefined") {
      navigate(`${routes.createBase}/${friendId}?date=${dateQ}`);
    } else {
      navigate(`${routes.createBase}?date=${dateQ}`);
    }
  };

  // Container style extracted to avoid any malformed inline object issues
  const containerStyle = {
    width: isSmallScreen ? "100%" : "calc(100vw - 370px)",
    // Revert to original height: viewport height minus 100px as requested
    height: isSmallScreen ? "auto" : "calc(100vh - 100px)",
    maxHeight: isSmallScreen ? "none" : "calc(100vh - 100px)",
    minHeight: isSmallScreen ? "auto" : "calc(100vh - 100px)",
    marginRight: isSmallScreen ? "0" : "20px",
    borderRadius: "8px",
    boxSizing: "border-box",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    backgroundColor: colors.tertiary_bg,
  };

  const spendingLabel = t("calendarPage.summary.spending", "Spending");
  const incomeLabel = t("calendarPage.summary.income", "Income");
  const summaryAmount = loading ? "loading" : null;

  // Helper to classify a transaction type
  const classifyType = (t) => {
    if (t === "inflow" || t === "gain") return "gain";
    if (t === "outflow" || t === "loss") return "loss";
    return "neutral";
  };

  const typeStyles = {
    gain: {
      text: financeColors.income.base,
      border: financeColors.income.base,
      bgSelected: "rgba(6,214,160,0.07)",
      iconPath: "M8 14V2M8 2L3 7M8 2L13 7",
      iconStroke: financeColors.income.base,
    },
    loss: {
      text: financeColors.spending.base,
      border: financeColors.spending.base,
      bgSelected: "rgba(255,77,79,0.07)",
      iconPath: "M8 2V14M8 14L3 9M8 14L13 9",
      iconStroke: financeColors.spending.base,
    },
    neutral: {
      text: colors.placeholder_text,
      border: colors.primary_accent,
      bgSelected: "rgba(6,214,160,0.07)",
    },
  };

  const renderDirectionIcon = (cls) => {
    if (cls === "neutral") return null;
    const cfg = typeStyles[cls];
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          display: "inline",
          verticalAlign: "middle",
          marginBottom: "-2px",
        }}
      >
        <path
          d={cfg.iconPath}
          stroke={cfg.iconStroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div
      className="p-4 rounded-lg"
      style={{ ...containerStyle, backgroundColor: colors.secondary_bg }}
    >
      {/* Back to calendar button */}
      <IconButton
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          color: colors.secondary_accent,
          backgroundColor: colors.primary_bg,
          "&:hover": { backgroundColor: colors.hover_bg },
          zIndex: 10,
        }}
        onClick={() => {
          if (friendId && friendId !== "undefined")
            navigate(`${routes.calendarBase}/${friendId}`);
          else navigate(`${routes.calendarBase}`);
        }}
        aria-label="Back"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 18L9 12L15 6"
            stroke={colors.secondary_accent}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </IconButton>
      <Typography
        variant="h5"
        sx={{
          position: "absolute",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          fontWeight: 700,
          textAlign: "center",
          color: colors.primary_text,
          m: 0,
          zIndex: 15,
          letterSpacing: 0.5,
        }}
      >
        {t("calendarPage.dayViewTitle", "Day View")}
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          mb: 2,
          mt: 3,
          gap: 1.5,
          px: { xs: 0.5, sm: 1 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 1.25, sm: 2 },
            flexDirection: isSmallScreen ? "column" : "row",
            width: "100%",
          }}
        >
          <FinanceSummaryCard
            label={spendingLabel}
            amount={summaryAmount ?? totalLosses}
            accentColor={financeColors.spending.base}
            textColor={financeColors.spending.text}
            iconType="down"
            isSmallScreen={isSmallScreen}
            currencySymbol={currencySymbol}
            colors={colors}
          />
          <DayNavigator
            selectedDate={currentDay}
            onPrevDay={handlePrevDay}
            onNextDay={handleNextDay}
            onDateChange={(newValue) => {
              if (newValue) goToDay(newValue);
            }}
            isSmallScreen={isSmallScreen}
            colors={colors}
            dateFormat={dateFormat}
            disableNext={isViewingToday}
          />
          <FinanceSummaryCard
            label={incomeLabel}
            amount={summaryAmount ?? totalGains}
            accentColor={financeColors.income.base}
            textColor={financeColors.income.text}
            iconType="up"
            isSmallScreen={isSmallScreen}
            currencySymbol={currencySymbol}
            colors={colors}
          />
        </Box>
      </Box>
      {/* Scrollable content */}
      <Box
        className="day-unified-scroll"
        sx={{
          flex: 1,
          overflow: "auto",
          background: colors.primary_bg,
          borderRadius: 2,
          p: 2,
          position: "relative",
          minHeight: 0,
          height: "100%",
        }}
      >
        {loading ? (
          <DayViewSkeleton loading={true} isEmpty={false} showAddHint={false} />
        ) : transactions.length === 0 ? (
          <DayViewSkeleton
            loading={false}
            isEmpty={true}
            showAddHint={hasWriteAccess}
            emptyTitle={emptyTitle}
            iconSrc={cardPaymentIconAsset}
          />
        ) : (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "flex-start",
            }}
          >
            {transactions.map((item, idx) => {
              const isSelected = selectedCardIdx === idx;
              const rawType = item.type || item.expense?.type;
              const cls = classifyType(rawType);
              const cfg = typeStyles[cls];
              const amount = item.expense?.amount || item.amount || 0;
              return (
                <Box
                  key={idx}
                  onClick={() => setSelectedCardIdx(isSelected ? null : idx)}
                  sx={{
                    background: isSelected
                      ? cfg.bgSelected
                      : colors.secondary_bg,
                    borderRadius: 2,
                    p: 2,
                    mb: 1,
                    boxShadow: 2,
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 220,
                    maxWidth: 340,
                    width: "100%",
                    height: 120,
                    justifyContent: "space-between",
                    overflow: "hidden",
                    border: isSelected
                      ? `2px solid ${cfg.border}`
                      : "2px solid transparent",
                    cursor: "pointer",
                    transition: "background 0.2s, border 0.2s",
                    position: "relative",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      className="font-semibold text-lg truncate min-w-0"
                      title={item.expense?.expenseName || item.name || "-"}
                      sx={{
                        color: colors.primary_text,
                        maxWidth: "60%",
                        fontWeight: 700,
                        fontSize: 16,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.expense?.expenseName || item.name || "-"}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          color: cfg.text,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {renderDirectionIcon(cls)}
                      </span>
                      <Typography
                        sx={{
                          color: cfg.text,
                          fontSize: 16,
                          fontWeight: 700,
                          ml: 0.5,
                        }}
                      >
                        {currencySymbol}
                        {Math.abs(amount).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    className="text-gray-300 text-sm"
                    title={item.expense?.comments || item.comments || ""}
                    sx={{
                      color: colors.secondary_text,
                      fontSize: 14,
                      mt: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      whiteSpace: "normal",
                      width: "100%",
                      minHeight: 36,
                    }}
                  >
                    {item.expense?.comments || item.comments || ""}
                  </Typography>
                  {isSelected && hasWriteAccess && (
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                        display: "flex",
                        gap: 1,
                        zIndex: 2,
                        background: colors.secondary_bg,
                        borderRadius: 1,
                        p: 0.5,
                        boxShadow: 1,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconButton
                        size="small"
                        sx={{ color: colors.secondary_accent, p: "4px" }}
                        onClick={() => handleEdit(item)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{ color: "#ff4d4f", p: "4px" }}
                        onClick={() => handleDeleteInit(item)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
        {hasWriteAccess && (
          <IconButton
            sx={{
              position: "fixed",
              right: 60,
              bottom: 100,
              background: colors.secondary_bg,
              color: colors.secondary_accent,
              borderRadius: "50%",
              width: 56,
              height: 56,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: 4,
              transition: "background 0.2s, color 0.2s",
              "&:hover": {
                background: colors.hover_bg,
                color: colors.primary_accent,
              },
            }}
            onClick={addNew}
            aria-label="Add Item"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke={colors.secondary_accent}
                strokeWidth="2"
                fill={colors.secondary_bg}
              />
              <path
                d="M12 8V16"
                stroke={colors.secondary_accent}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M8 12H16"
                stroke={colors.secondary_accent}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </IconButton>
        )}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={handleCancelDelete}
          title={`Delete ${type === "bill" ? "Bill" : "Expense"}`}
          data={
            itemToDelete
              ? {
                  name:
                    itemToDelete.expense?.expenseName ||
                    itemToDelete.expenseName ||
                    "-",
                  amount:
                    itemToDelete.expense?.amount || itemToDelete.amount || 0,
                  type: itemToDelete.type || itemToDelete.expense?.type,
                  paymentMethod: itemToDelete.expense?.paymentMethod,
                  comments: itemToDelete.expense?.comments,
                  date: itemToDelete.expense?.date,
                }
              : {}
          }
          headerNames={{
            name: type === "bill" ? "Bill Name" : "Expense Name",
            amount: "Amount",
            type: "Type",
            paymentMethod: "Payment Method",
            comments: "Comments",
            date: "Date",
          }}
          onApprove={handleConfirmDelete}
          onDecline={handleCancelDelete}
          approveText="Yes, Delete"
          declineText="No, Cancel"
        />
      </Box>

      {/* Jump to Today Button */}
      <JumpToTodayButton
        onClick={handleJumpToToday}
        isToday={isViewingToday}
        visible={true}
        position="absolute"
        customPosition={{ top: 16, right: 30 }}
        viewType="day"
        zIndex={20}
      />

      <ToastNotification
        open={toastOpen}
        setOpen={setToastOpen}
        message={toastMessage}
        severity="info"
      />
    </div>
  );
};

export default DayUnifiedView;
