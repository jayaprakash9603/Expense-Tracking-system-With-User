import React, { useMemo, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Typography, IconButton, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { getExpensesAction } from "../../Redux/Expenses/expense.action";

const DayTransactionsView = () => {
  const [showNewExpense, setShowNewExpense] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { date } = useParams(); // date in YYYY-MM-DD
  const { cashflowExpenses } = useSelector((state) => state.expenses);
  const currentDay = dayjs(date);

  useEffect(() => {
    dispatch(getExpensesAction());
  }, [dispatch]);

  // Get all transactions for this day
  const transactions = useMemo(() => {
    return (cashflowExpenses || []).filter((item) => {
      const d = dayjs(item.date || item.expense?.date);
      return d.isSame(currentDay, "day");
    });
  }, [cashflowExpenses, currentDay]);

  return (
    <div
      className="bg-[#0b0b0b] p-4 rounded-lg mt-[50px]"
      style={{
        width: "calc(100vw - 370px)",
        height: "calc(100vh - 100px)",
        marginRight: "20px",
        borderRadius: "8px",
        boxSizing: "border-box",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Back to calendar button */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton
          onClick={() => navigate("/calendar-view", { replace: true })}
          sx={{ color: "#00dac6", mr: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>
      {/* Date with left/right arrows tightly around */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
        }}
      >
        <IconButton
          onClick={() =>
            navigate(
              `/day-view/${currentDay.subtract(1, "day").format("YYYY-MM-DD")}`
            )
          }
          sx={{ color: "#00dac6", mr: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h6"
          sx={{
            color: "#fff",
            fontWeight: 700,
            minWidth: 120,
            textAlign: "center",
            mx: 1,
          }}
        >
          {currentDay.format("DD MMM YYYY")}
        </Typography>
        <IconButton
          onClick={() =>
            navigate(
              `/day-view/${currentDay.add(1, "day").format("YYYY-MM-DD")}`
            )
          }
          sx={{ color: "#00dac6", ml: 1 }}
        >
          <ArrowBackIcon style={{ transform: "scaleX(-1)" }} />
        </IconButton>
      </Box>
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          background: "#1b1b1b",
          borderRadius: 2,
          p: 2,
          position: "relative",
        }}
      >
        {transactions.length === 0 ? (
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
            {transactions.map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  background: "#0b0b0b", // Changed card background to #0b0b0b
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
                }}
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
                      fontSize: 18,
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
                      const isGain = type === "gain";
                      const isLoss = type === "loss";
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
              </Box>
            ))}
          </Box>
        )}
        {/* Global floating + button at bottom right */}
        <Button
          sx={{
            position: "fixed",
            right: 60,
            bottom: 100, // Move the button further up from the bottom
            background: "#fff",
            color: "#0b0b0b",
            borderRadius: "50%", // Make the button perfectly circular
            width: 56,
            height: 56,
            // boxShadow: 4,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
            "&:hover": { background: "#f0f0f0" },
          }}
          onClick={() => setShowNewExpense(true)}
        >
          +
        </Button>
      </Box>
    </div>
  );
};

export default DayTransactionsView;
