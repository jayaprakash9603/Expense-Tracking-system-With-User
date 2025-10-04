import React, { useMemo, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Typography, IconButton, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import {
  getExpensesByParticularDate,
  deleteExpenseAction,
} from "../../Redux/Expenses/expense.action";
import Modal from "./Modal";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ToastNotification from "./ToastNotification";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  deleteBill,
  getBillByExpenseId,
  getBillsByParticularDate,
} from "../../Redux/Bill/bill.action";

const DayBillsView = () => {
  const [selectedCardIdx, setSelectedCardIdx] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { date, friendId } = useParams(); // date in YYYY-MM-DD
  const { particularDateBills = [], loading } = useSelector(
    (state) => state.bill
  );
  const currentDay = dayjs(date);

  useEffect(() => {
    if (date) {
      dispatch(getBillsByParticularDate(date, friendId || ""));
    }
  }, [dispatch, date]);

  // Get all transactions for this day
  const transactions = useMemo(() => {
    return Array.isArray(particularDateBills) ? particularDateBills : [];
  }, [particularDateBills]);

  // Calculate total gains and losses for the day
  const { totalGains, totalLosses } = useMemo(() => {
    let gains = 0,
      losses = 0;
    transactions.forEach((item) => {
      const type = item.type || item.expense?.type;
      const amt = item.expense?.amount || 0;
      if (type === "gain" || type === "inflow") gains += amt;
      if (type === "loss" || type === "outflow") losses += amt;
    });
    return { totalGains: gains, totalLosses: losses };
  }, [transactions]);

  // Navigation handlers
  const handlePrevDay = () => {
    const prevDate = currentDay.subtract(1, "day").format("YYYY-MM-DD");
    setSelectedCardIdx(null);
    friendId && friendId !== "undefined"
      ? navigate(`/bill-day-view/${prevDate}/friend/${friendId}`)
      : navigate(`/bill-day-view/${prevDate}`);
  };
  const handleNextDay = () => {
    const nextDate = currentDay.add(1, "day").format("YYYY-MM-DD");
    setSelectedCardIdx(null); // Deselect on date change
    friendId && friendId !== "undefined"
      ? navigate(`/bill-day-view/${nextDate}/friend/${friendId}`)
      : navigate(`/bill-day-view/${nextDate}`);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCardIdx(null);
  };

  // Update handlers to receive the item
  const handleEdit = async (item) => {
    const id = item.id || item.expense?.id || item.expenseId;
    const bill = await dispatch(getBillByExpenseId(id));

    console.log("bill", bill);
    if (id) {
      friendId && friendId !== "undefined"
        ? navigate(`/bill/edit/${bill.id}/friend/${friendId}`)
        : navigate(`/bill/edit/${bill.id}`);
      setToastMessage("Expense edit page opened.");
      setToastOpen(true);
    }
  };

  const handleDelete = (item) => {
    setExpenseToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    const id =
      expenseToDelete.id ||
      expenseToDelete.expense?.id ||
      expenseToDelete.expenseId;
    if (!id) return;
    const bill = await dispatch(getBillByExpenseId(id));
    dispatch(deleteBill(bill.id, friendId || ""))
      .then(() => {
        setToastMessage("Expense deleted successfully.");
        setToastOpen(true);
        setSelectedCardIdx(null);
        // Refresh the list for the current day
        dispatch(
          getBillsByParticularDate(
            currentDay.format("YYYY-MM-DD"),
            friendId || ""
          )
        );
      })
      .catch(() => {
        setToastMessage("Error deleting expense. Please try again.");
        setToastOpen(true);
      })
      .finally(() => {
        setIsDeleteModalOpen(false);
        setExpenseToDelete(null);
      });
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setExpenseToDelete(null);
  };

  // Helper to format numbers as K, M, B, etc.
  function formatAmount(num) {
    if (num === 0) return "0";
    const absNum = Math.abs(num);
    const format = (val, suffix) => {
      // Remove trailing .00 if present
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

  return (
    <div
      className="bg-[#0b0b0b] p-4 rounded-lg"
      style={{
        width: "calc(100vw - 370px)",
        height: "calc(100vh - 100px)",
        marginRight: "20px",
        borderRadius: "8px",
        boxSizing: "border-box",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        minHeight: "700px", // Ensures minimum height for visual consistency
        maxHeight: "calc(100vh - 100px)", // Prevents overflow
      }}
    >
      {/* Toast Notification */}
      <ToastNotification
        open={toastOpen}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
      {/* Back to calendar button */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            color: "#00DAC6",
            backgroundColor: "#1b1b1b",
            "&:hover": {
              backgroundColor: "#28282a",
            },
            zIndex: 10,
          }}
          onClick={() => {
            if (friendId && friendId !== "undefined") {
              navigate(`/bill/calendar${friendId}`);
            } else {
              navigate("/bill/calendar");
            }
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
      </Box>
      {/* Header for Day View */}
      <Typography
        variant="h5"
        sx={{
          mb: 2,
          fontWeight: 700,
          textAlign: "center",
          color: "#fff",
          mt: 1,
        }}
      >
        Day View
      </Typography>
      {/* Income and Spending cards */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
          justifyContent: "center",
          gap: 2,
          position: "relative",
          mt: -4,
        }}
      >
        {/* Total Losses card on the left */}
        <Box
          sx={{
            background: "#cf667a",
            borderRadius: "40px",
            py: 1.5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: 2,
            minWidth: 190,
            maxWidth: 190,
            mr: 4,
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
            {/* Fixed-width arrow container */}
            <Box
              sx={{
                width: 48,
                minWidth: 48,
                maxWidth: 48,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#e2a4af",
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
                <circle cx="16" cy="16" r="15" fill="#e2a4af" />
                <path
                  d="M16 8v16M16 24l7-7M16 24l-7-7"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Box>
            {/* Text content grows to fill */}
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
                  color: "#e6a2af",
                  fontWeight: 700,
                  lineHeight: 1.2,
                  textAlign: "justify",
                }}
              >
                Spending
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
                ₹{formatAmount(totalLosses)}
              </Typography>
            </Box>
          </Box>
        </Box>
        {/* Date with left/right arrows tightly around, and date picker */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            background: "none",
            boxShadow: "none",
            p: 0,
            m: 0,
          }}
        >
          <IconButton onClick={handlePrevDay} sx={{ color: "#00dac6", mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={currentDay}
              onChange={(newValue) => {
                if (newValue) {
                  setSelectedCardIdx(null); // Deselect on date change
                  friendId && friendId !== "undefined"
                    ? navigate(
                        `/bill-day-view/${dayjs(newValue).format(
                          "YYYY-MM-DD"
                        )}/friend/${friendId}`
                      )
                    : navigate(
                        `/bill-day-view/${dayjs(newValue).format("YYYY-MM-DD")}`
                      );
                }
              }}
              sx={{
                background: "#1b1b1b",
                borderRadius: 2,
                color: "#fff",
                ".MuiInputBase-input": { color: "#fff" },
                ".MuiSvgIcon-root": { color: "#00dac6" },
                width: 140,
              }}
              slotProps={{
                textField: {
                  size: "small",
                  variant: "outlined",
                  sx: { color: "#fff" },
                  inputProps: {
                    max: dayjs().format("YYYY-MM-DD"),
                  },
                },
              }}
              disableFuture
              format="YYYY-MM-DD"
            />
          </LocalizationProvider>
          <IconButton onClick={handleNextDay} sx={{ color: "#00dac6", ml: 1 }}>
            <ArrowBackIcon style={{ transform: "scaleX(-1)" }} />
          </IconButton>
        </Box>
        {/* Total Gains card on the right */}
        <Box
          sx={{
            background: "#437746",
            borderRadius: "40px",
            py: 1.5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: 2,
            minWidth: 190,
            maxWidth: 190,
            ml: 4,
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
            {/* Fixed-width arrow container */}
            <Box
              sx={{
                width: 48,
                minWidth: 48,
                maxWidth: 48,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#84ba86",
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
                <circle cx="16" cy="16" r="15" fill="#84ba86" />
                <path
                  d="M16 24V8M16 8L9 15M16 8L23 15"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Box>
            {/* Text content grows to fill */}
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
                  color: "#83b985",
                  fontWeight: 700,
                  lineHeight: 1.2,
                  textAlign: "justify",
                }}
              >
                Income
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
                ₹{formatAmount(totalGains)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          background: "#1b1b1b",
          borderRadius: 2,
          p: 2,
          position: "relative",
          minHeight: "0px",
          height: "100%",
        }}
      >
        {loading ? (
          <Typography color="#b0b6c3" sx={{ textAlign: "center", mt: 4 }}>
            Loading...
          </Typography>
        ) : transactions.length === 0 ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              py: 4,
              position: "relative",
            }}
          >
            <img
              src={require("../../assests/card-payment.png")}
              alt="No transactions"
              style={{
                width: 120,
                height: 120,
                marginBottom: 16,
                objectFit: "contain",
              }}
            />
            <Typography variant="h6" color="#fff" fontWeight={700}>
              No transactions!
            </Typography>
            <Typography variant="body2" color="#b0b6c3" sx={{ mt: 0.5 }}>
              Click + to add one.
            </Typography>
          </Box>
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
              const type = item.type || item.expense?.type;
              const isGain = type === "inflow" || type === "gain";
              const isLoss = type === "outflow" || type === "loss";
              return (
                <Box
                  key={idx}
                  sx={{
                    background: isSelected
                      ? isGain
                        ? "rgba(6, 214, 160, 0.07)" // increased transparency
                        : isLoss
                        ? "rgba(255, 77, 79, 0.07)" // increased transparency
                        : "rgba(6, 214, 160, 0.07)"
                      : "#0b0b0b",
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
                      ? isGain
                        ? "2px solid #06d6a0"
                        : isLoss
                        ? "2px solid #ff4d4f"
                        : "2px solid #06d6a0"
                      : "2px solid transparent",
                    cursor: "pointer",
                    transition: "background 0.2s, border 0.2s",
                    position: "relative",
                  }}
                  onClick={() =>
                    setSelectedCardIdx(selectedCardIdx === idx ? null : idx)
                  }
                >
                  {/* Expense name and amount in one row */}
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
                      title={item.expense?.expenseName || "-"}
                      sx={{
                        color: "#fff",
                        maxWidth: "60%",
                        fontWeight: 700,
                        fontSize: 16, // Decreased font size from 18 to 16
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.expense?.expenseName || "-"}
                    </Typography>
                    {/* Amount with color and icon */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        minWidth: 0,
                      }}
                    >
                      {(() => {
                        const type = item.type || item.expense?.type;
                        const amount = item.expense?.amount || 0;
                        const isGain = type === "inflow" || type === "gain";
                        const isLoss = type === "outflow" || type === "loss";
                        return (
                          <>
                            <span
                              style={{
                                color: isGain
                                  ? "#06d6a0"
                                  : isLoss
                                  ? "#ff4d4f"
                                  : "#b0b6c3",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              {isGain ? (
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
                                    d="M8 14V2M8 2L3 7M8 2L13 7"
                                    stroke="#06d6a0"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              ) : isLoss ? (
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
                                    d="M8 2V14M8 14L3 9M8 14L13 9"
                                    stroke="#ff4d4f"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              ) : null}
                            </span>
                            <Typography
                              sx={{
                                color: isGain
                                  ? "#06d6a0"
                                  : isLoss
                                  ? "#ff4d4f"
                                  : "#b0b6c3",
                                fontSize: 16,
                                fontWeight: 700,
                                ml: 0.5,
                              }}
                            >
                              ₹{Math.abs(amount).toFixed(2)}
                            </Typography>
                          </>
                        );
                      })()}
                    </Box>
                  </Box>
                  {/* Comments below, up to 2 lines with ellipsis and tooltip */}
                  <Typography
                    className="text-gray-300 text-sm"
                    title={item.expense?.comments || ""}
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
                      minHeight: 36, // ensures space for 2 lines
                    }}
                  >
                    {item.expense?.comments || ""}
                  </Typography>
                  {/* Edit/Delete actions on highlight */}
                  {isSelected && (
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
                        onClick={() => handleDelete(item)}
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
        {/* Global floating + button at bottom right */}
        <IconButton
          sx={{
            position: "fixed",
            right: 60,
            bottom: 100, // Move the button further up from the bottom
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
            "&:hover": {
              background: "#2e335a",
              color: "#fff",
            },
          }}
          onClick={() =>
            friendId && friendId !== "undefined"
              ? navigate(
                  `/bill/create/${friendId}?date=${currentDay.format(
                    "YYYY-MM-DD"
                  )}`
                )
              : navigate(`/bill/create?date=${currentDay.format("YYYY-MM-DD")}`)
          }
          aria-label="Add Expense"
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
        {/* Modal for expense details */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          title="Expense Details"
          data={modalData}
          headerNames={{
            name: "Expense Name",
            amount: "Amount",
            type: "Type",
            paymentMethod: "Payment Method",
            netAmount: "Net Amount",
            comments: "Comments",
            creditDue: "Credit Due",
            date: "Date",
          }}
          onApprove={handleEdit}
          onDecline={handleDelete}
          approveText="Edit"
          declineText="Delete"
        />
        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={handleCancelDelete}
          title="Delete Bill"
          data={
            expenseToDelete
              ? {
                  name: expenseToDelete.expense?.expenseName || "-",
                  amount: expenseToDelete.expense?.amount || 0,
                  type: expenseToDelete.type || expenseToDelete.expense?.type,
                  paymentMethod: expenseToDelete.expense?.paymentMethod,
                  comments: expenseToDelete.expense?.comments,
                  date: expenseToDelete.expense?.date,
                }
              : {}
          }
          headerNames={{
            name: "Bill Name",
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
    </div>
  );
};

export default DayBillsView;
