import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getExpensesSummaryAction } from "../../Redux/Expenses/expense.action";
import { Skeleton } from "@mui/material"; // ✅ Import Skeleton

const shimmerKeyframes = {
  "@keyframes shimmer": {
    "0%": { backgroundPosition: "-1000px 0" },
    "100%": { backgroundPosition: "1000px 0" },
  },
};

const RecentExpenses = () => {
  const dispatch = useDispatch();
  const { summary, loading } = useSelector((state) => state.expenses || {});
  const lastFiveExpenses = summary?.lastFiveExpenses || [];
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    dispatch(getExpensesSummaryAction());
  }, [dispatch]);

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
          width: "800px",
          height: "300px",
          backgroundColor: "rgb(27, 27, 27)",
          borderRadius: "8px",
          border: "1px solid rgb(56, 56, 56)",
          padding: "16px",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%" }}>
          <p
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: "22px",
              marginBottom: "12px",
            }}
          >
            Recent Expenses
          </p>
        </div>

        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  width: "100%",
                  padding: "10px 0",
                  borderBottom: "1px solid rgb(40, 40, 40)",
                  height: "50px",
                }}
              >
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
                    marginRight: 2,
                  }}
                />
                <Skeleton
                  variant="text"
                  width="10%"
                  height={20}
                  sx={{
                    ...shimmerKeyframes,
                    bgcolor: "#2c2c2c",
                    backgroundImage:
                      "linear-gradient(90deg, #2c2c2c 0%, #3a3a3a 50%, #2c2c2c 100%)",
                    backgroundSize: "1000px 100%",
                    animation: "shimmer 2s infinite linear",
                    marginRight: 2,
                  }}
                />
                <Skeleton
                  variant="text"
                  width="10%"
                  height={20}
                  sx={{
                    ...shimmerKeyframes,
                    bgcolor: "#2c2c2c",
                    backgroundImage:
                      "linear-gradient(90deg, #2c2c2c 0%, #3a3a3a 50%, #2c2c2c 100%)",
                    backgroundSize: "1000px 100%",
                    animation: "shimmer 2s infinite linear",
                    marginRight: 2,
                  }}
                />
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
                    marginRight: 2,
                  }}
                />
                <Skeleton
                  variant="text"
                  width="30%"
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
                }}
              >
                <div
                  style={{
                    flex: 2,
                    paddingLeft: "10px",
                  }}
                >
                  {expense.expenseName}
                </div>
                <div
                  style={{
                    flex: 1,
                    color: expense.type === "loss" ? "red" : "limegreen",
                  }}
                >
                  {mapExpenseType(expense.type)}
                </div>
                <div style={{ flex: 1 }}>{expense.amount}</div>
                <div style={{ flex: 2 }}>
                  {mapPaymentMethod(expense.paymentMethod)}
                </div>
                <div style={{ flex: 2, color: "gray" }}>{date}</div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default RecentExpenses;
