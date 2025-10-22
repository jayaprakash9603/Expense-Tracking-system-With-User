import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import ToastNotification from "../../pages/Landingpage/ToastNotification";
import Modal from "../../pages/Landingpage/Modal";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DayViewSkeleton from "../DayViewSkeleton";
import JumpToTodayButton from "../JumpToTodayButton";
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
  };

  // Summary card configuration (Spending & Income)
  const summaryCards = [
    {
      key: "losses",
      label: "Spending",
      amount: totalLosses,
      outerColor: "#cf667a",
      iconBg: "#e2a4af",
      valueColor: "#e6a2af",
      svgPath: "M16 8v16M16 24l7-7M16 24l-7-7",
    },
    {
      key: "gains",
      label: "Income",
      amount: totalGains,
      outerColor: "#437746",
      iconBg: "#84ba86",
      valueColor: "#83b985",
      svgPath: "M16 24V8M16 8L9 15M16 8L23 15",
    },
  ];

  // Helper to classify a transaction type
  const classifyType = (t) => {
    if (t === "inflow" || t === "gain") return "gain";
    if (t === "outflow" || t === "loss") return "loss";
    return "neutral";
  };

  const typeStyles = {
    gain: {
      text: "#06d6a0",
      border: "#06d6a0",
      bgSelected: "rgba(6,214,160,0.07)",
      iconPath: "M8 14V2M8 2L3 7M8 2L13 7",
      iconStroke: "#06d6a0",
    },
    loss: {
      text: "#ff4d4f",
      border: "#ff4d4f",
      bgSelected: "rgba(255,77,79,0.07)",
      iconPath: "M8 2V14M8 14L3 9M8 14L13 9",
      iconStroke: "#ff4d4f",
    },
    neutral: {
      text: "#b0b6c3",
      border: "#06d6a0", // fallback accent
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
    <div className="bg-[#0b0b0b] p-4 rounded-lg" style={containerStyle}>
      {/* Back to calendar button */}
      <IconButton
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          color: "#00DAC6",
          backgroundColor: "#1b1b1b",
          "&:hover": { backgroundColor: "#28282a" },
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
            stroke="#00DAC6"
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
          color: "#fff",
          m: 0,
          zIndex: 15,
          letterSpacing: 0.5,
        }}
      >
        Day View
      </Typography>
      {/* Summary cards + date picker */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
          justifyContent: "center",
          gap: isSmallScreen ? 1 : 2,
          position: "relative",
          // Provide vertical offset so content does not overlap with absolute header
          mt: 3,
          flexDirection: isSmallScreen ? "column" : "row",
          paddingTop: isSmallScreen ? 0 : 1,
          pt: isSmallScreen ? 0 : 1,
        }}
      >
        {/* Left (Spending) Card */}
        {(() => {
          const c = summaryCards[0];
          return (
            <Box
              key={c.key}
              sx={{
                background: c.outerColor,
                borderRadius: "40px",
                py: 1.5,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                boxShadow: 2,
                minWidth: isSmallScreen ? "100%" : 190,
                maxWidth: isSmallScreen ? "100%" : 190,
                mr: isSmallScreen ? 0 : 4,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 0.5,
                  flexDirection: "row",
                  justifyContent: "space-around",
                  height: 40,
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    minWidth: 48,
                    maxWidth: 48,
                    height: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: c.iconBg,
                    borderRadius: "50%",
                    mr: 1,
                    ml: 1.5,
                  }}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ display: "block" }}
                  >
                    <circle cx="16" cy="16" r="15" fill={c.iconBg} />
                    <path
                      d={c.svgPath}
                      stroke="#fff"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    height: "100%",
                    flex: 1,
                    ml: -0.5,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: c.valueColor,
                      fontWeight: 700,
                      lineHeight: 1.2,
                      textAlign: "justify",
                    }}
                  >
                    {c.label}
                  </Typography>
                  <Typography
                    variant="h6"
                    color="#fff"
                    fontWeight={700}
                    sx={{
                      lineHeight: 1.2,
                      fontSize: "1.25rem",
                      textAlign: "left",
                      mt: 0.5,
                    }}
                  >
                    ₹{formatAmount(c.amount)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })()}
        {/* Date Picker Center */}
        <Box
          sx={{
            display: "flex",
            flexDirection: isSmallScreen ? "column" : "row",
            alignItems: "center",
            justifyContent: "center",
            gap: isSmallScreen ? 1 : 2,
            minWidth: isSmallScreen ? "100%" : 260,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={handlePrevDay}
              sx={{ color: "#00dac6", mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={currentDay}
                onChange={(newValue) => {
                  if (newValue) goToDay(newValue);
                }}
                sx={{
                  background: "#23243a",
                  borderRadius: 2,
                  color: "#fff",
                  ".MuiInputBase-input": {
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                  },
                  ".MuiSvgIcon-root": { color: "#00dac6" },
                  width: 180,
                }}
                slotProps={{
                  textField: {
                    size: "small",
                    variant: "outlined",
                    sx: { color: "#fff" },
                  },
                }}
                disableFuture
                format="YYYY-MM-DD"
              />
            </LocalizationProvider>
            <IconButton
              onClick={handleNextDay}
              sx={{ color: "#00dac6", ml: 1 }}
            >
              <ArrowBackIcon style={{ transform: "scaleX(-1)" }} />
            </IconButton>
          </Box>
        </Box>
        {/* Right (Income) Card */}
        {(() => {
          const c = summaryCards[1];
          return (
            <Box
              key={c.key}
              sx={{
                background: c.outerColor,
                borderRadius: "40px",
                py: 1.5,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                boxShadow: 2,
                minWidth: isSmallScreen ? "100%" : 190,
                maxWidth: isSmallScreen ? "100%" : 190,
                ml: isSmallScreen ? 0 : 4,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 0.5,
                  flexDirection: "row",
                  justifyContent: "space-around",
                  height: 40,
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    minWidth: 48,
                    maxWidth: 48,
                    height: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: c.iconBg,
                    borderRadius: "50%",
                    mr: 1,
                    ml: 1.5,
                  }}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ display: "block" }}
                  >
                    <circle cx="16" cy="16" r="15" fill={c.iconBg} />
                    <path
                      d={c.svgPath}
                      stroke="#fff"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    height: "100%",
                    flex: 1,
                    ml: -0.5,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: c.valueColor,
                      fontWeight: 700,
                      lineHeight: 1.2,
                      textAlign: "justify",
                    }}
                  >
                    {c.label}
                  </Typography>
                  <Typography
                    variant="h6"
                    color="#fff"
                    fontWeight={700}
                    sx={{
                      lineHeight: 1.2,
                      fontSize: "1.25rem",
                      textAlign: "left",
                      mt: 0.5,
                    }}
                  >
                    ₹{formatAmount(c.amount)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })()}
      </Box>
      {/* Scrollable content */}
      <Box
        className="day-unified-scroll"
        sx={{
          flex: 1,
          overflow: "auto",
          background: "#1b1b1b",
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
            iconSrc={require("../../assests/card-payment.png")}
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
                    background: isSelected ? cfg.bgSelected : "#0b0b0b",
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
                        color: "#fff",
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
                        ₹{Math.abs(amount).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    className="text-gray-300 text-sm"
                    title={item.expense?.comments || item.comments || ""}
                    sx={{
                      color: "#b0b6c3",
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
                        background: "#23243a",
                        borderRadius: 1,
                        p: 0.5,
                        boxShadow: 1,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconButton
                        size="small"
                        sx={{ color: "#5b7fff", p: "4px" }}
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
              background: "#23243a",
              color: "#5b7fff",
              borderRadius: "50%",
              width: 56,
              height: 56,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: 4,
              transition: "background 0.2s, color 0.2s",
              "&:hover": { background: "#2e335a", color: "#fff" },
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
                stroke="#5b7fff"
                strokeWidth="2"
                fill="#23243a"
              />
              <path
                d="M12 8V16"
                stroke="#5b7fff"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M8 12H16"
                stroke="#5b7fff"
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
