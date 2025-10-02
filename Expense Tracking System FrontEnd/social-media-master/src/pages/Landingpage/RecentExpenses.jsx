import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getExpensesSummaryAction } from "../../Redux/Expenses/expense.action";
import { Skeleton, useMediaQuery, useTheme } from "@mui/material";

const shimmerKeyframes = {
  "@keyframes shimmer": {
    "0%": { backgroundPosition: "-1000px 0" },
    "100%": { backgroundPosition: "1000px 0" },
  },
};

const RecentExpenses = () => {
  const dispatch = useDispatch();
  const { summary, loading } = useSelector((state) => state.expenses || {});
  const lastFiveExpenses = summary?.lastTenExpenses || [];
  const [hoveredId, setHoveredId] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const mapPaymentMethod = (method) => {
    switch (method) {
      case "cash":
        return "Cash";
      case "creditNeedToPaid":
        return "Credit Due";
      case "creditPaid":
        return "Credit Card Bill Paid";
      default:
        return method;
    }
  };

  const mapExpenseType = (type) => {
    switch (type) {
      case "loss":
        return "Loss";
      case "gain":
        return "Gain";
      default:
        return type;
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          width: isMobile ? "90vw" : "800px",
          height: "300px",
          backgroundColor: "rgb(27, 27, 27)",
          borderRadius: "8px",
          border: "1px solid rgb(56, 56, 56)",
          padding: "16px",
          boxSizing: "border-box",
          // overflowX: "auto",
        }}
      >
        <div style={{ width: "100%", marginBottom: "12px" }}>
          <p
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: "22px",
              margin: 0,
            }}
          >
            Recent Expenses
          </p>
        </div>

        {loading
          ? Array.from({
              length: isMobile ? 3 : 5,
            }).map((_, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  width: "100%",
                  padding: "10px 0",
                  borderBottom: "1px solid rgb(40, 40, 40)",
                  height: "50px",
                  boxSizing: "border-box",
                }}
              >
                <Skeleton
                  variant="text"
                  width={isMobile ? "40%" : "25%"}
                  height={20}
                  sx={{
                    ...shimmerKeyframes,
                    bgcolor: "#2c2c2c",
                    backgroundImage:
                      "linear-gradient(90deg, #2c2c2c 0%, #3a3a3a 50%, #2c2c2c 100%)",
                    backgroundSize: "1000px 100%",
                    animation: "shimmer 2s infinite linear",
                    marginRight: "10px",
                  }}
                />
                {!isMobile && (
                  <Skeleton
                    variant="text"
                    width="15%"
                    height={20}
                    sx={{
                      ...shimmerKeyframes,
                      bgcolor: "#2c2c2c",
                      backgroundImage:
                        "linear-gradient(90deg, #2c2c2c 0%, #3a3a3a 50%, #2c2c2c 100%)",
                      backgroundSize: "1000px 100%",
                      animation: "shimmer 2s infinite linear",
                      marginRight: "10px",
                    }}
                  />
                )}
                <Skeleton
                  variant="text"
                  width={isMobile ? "30%" : "15%"}
                  height={20}
                  sx={{
                    ...shimmerKeyframes,
                    bgcolor: "#2c2c2c",
                    backgroundImage:
                      "linear-gradient(90deg, #2c2c2c 0%, #3a3a3a 50%, #2c2c2c 100%)",
                    backgroundSize: "1000px 100%",
                    animation: "shimmer 2s infinite linear",
                    marginRight: "10px",
                  }}
                />
                {!isMobile && (
                  <Skeleton
                    variant="text"
                    width="20%"
                    height={20}
                    sx={{
                      ...shimmerKeyframes,
                      bgcolor: "#2c2c2c",
                      backgroundImage:
                        "linear-gradient(90deg, #2c2c2c 0%, #3a3a3a 50%, #2c2c2c 100%)",
                      backgroundSize: "1000px 100%",
                      animation: "shimmer 2s infinite linear",
                      marginRight: "10px",
                    }}
                  />
                )}
                <Skeleton
                  variant="text"
                  width={isMobile ? "30%" : "25%"}
                  height={20}
                  sx={{
                    ...shimmerKeyframes,
                    bgcolor: "#2c2c2c",
                    backgroundImage:
                      "linear-gradient(90deg, #2c2c2c 0%, #3a3a3a 50%, #2c2c2c 100%)",
                    backgroundSize: "1000px 100%",
                    animation: "shimmer 2s infinite linear",
                  }}
                />
              </div>
            ))
          : lastFiveExpenses.map(({ id, date, expense }) => (
              <div
                key={id}
                onMouseEnter={() => setHoveredId(id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  display: "flex",
                  width: "100%",
                  color: "white",
                  padding: "10px 0",
                  borderBottom: "1px solid rgb(40, 40, 40)",
                  fontSize: "15px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  height: hoveredId === id ? "60px" : "50px",
                  backgroundColor: hoveredId === id ? "#29282b" : "transparent",
                  boxSizing: "border-box",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: isMobile ? "40%" : "25%",
                    paddingLeft: "10px",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    boxSizing: "border-box",
                  }}
                  title={expense?.expenseName || "N/A"}
                >
                  {expense?.expenseName || "N/A"}
                </div>
                {!isMobile && (
                  <div
                    style={{
                      width: "15%",
                      color: expense?.type === "loss" ? "red" : "limegreen",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      boxSizing: "border-box",
                    }}
                  >
                    {mapExpenseType(expense?.type || "Unknown")}
                  </div>
                )}
                <div
                  style={{
                    width: isMobile ? "30%" : "15%",
                    color: isMobile
                      ? expense?.type === "loss"
                        ? "red"
                        : "limegreen"
                      : "inherit",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    boxSizing: "border-box",
                  }}
                >
                  {expense?.amount || 0}
                </div>
                {!isMobile && (
                  <div
                    style={{
                      width: "20%",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      boxSizing: "border-box",
                    }}
                  >
                    {mapPaymentMethod(expense?.paymentMethod || "Unknown")}
                  </div>
                )}
                <div
                  style={{
                    width: isMobile ? "30%" : "25%",
                    color: "gray",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    boxSizing: "border-box",
                  }}
                >
                  {date || "Unknown Date"}
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default RecentExpenses;
