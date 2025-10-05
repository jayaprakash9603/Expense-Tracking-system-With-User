import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie, Bar, Line, PolarArea } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
} from "chart.js";
import { Skeleton, useMediaQuery, useTheme } from "@mui/material";
import { API_BASE_URL } from "../../config/api";
import { useNavigate, useParams } from "react-router";
import { Box, Typography, Divider, IconButton } from "@mui/material";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale
);

const CreditDueContent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [expenseNamesData, setExpenseNamesData] = useState(null);
  const [monthlyExpensesData, setMonthlyExpensesData] = useState(null);
  const [expenseTrendData, setExpenseTrendData] = useState(null);
  const [paymentMethodData, setPaymentMethodData] = useState(null);
  const [cumulativeExpensesData, setCumulativeExpensesData] = useState(null);
  const [expenseOverTimeData, setExpenseOverTimeData] = useState(null);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("jwt");
  const { friendId } = useParams();
  const navigate = useNavigate();

  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const colorPalette = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEEAD",
    "#FFD166",
    "#06D6A0",
    "#118AB2",
    "#073B4C",
    "#EF476F",
  ];

  useEffect(() => {
    if (!token) {
      setError("Please log in to view the dashboard.");
      return;
    }

    const year = 2025;
    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
      try {
        const [
          byNameRes,
          monthlyRes,
          trendRes,
          paymentMethodsRes,
          cumulativeRes,
          nameOverTimeRes,
        ] = await Promise.all([
          axios.get(
            `${API_BASE_URL}/api/expenses/by-name?year=${year}&targetId=${
              friendId || ""
            }`,
            {
              headers,
            }
          ),
          axios.get(
            `${API_BASE_URL}/api/expenses/monthly?year=${year}&targetId=${
              friendId || ""
            }`,
            {
              headers,
            }
          ),
          axios.get(
            `${API_BASE_URL}/api/expenses/trend?year=${year}&targetId=${
              friendId || ""
            }`,
            {
              headers,
            }
          ),
          axios.get(
            `${API_BASE_URL}/api/expenses/payment-methods?year=${year}&targetId=${
              friendId || ""
            }`,
            { headers }
          ),
          axios.get(
            `${API_BASE_URL}/api/expenses/cumulative?year=${year}&targetId=${
              friendId || ""
            }`,
            {
              headers,
            }
          ),
          axios.get(
            `${API_BASE_URL}/api/expenses/name-over-time?year=${year}&limit=5&targetId=${
              friendId || ""
            }`,
            { headers }
          ),
        ]);

        const assignColors = (data, isMultiDataset = false) => {
          if (isMultiDataset) {
            return {
              ...data,
              datasets: data.datasets.map((dataset, i) => ({
                ...dataset,
                backgroundColor:
                  dataset.backgroundColor ||
                  colorPalette[i % colorPalette.length],
                borderColor: dataset.borderColor || "#1b1b1b",
                borderWidth: dataset.borderWidth || 1,
              })),
            };
          }
          return {
            ...data,
            datasets: data.datasets.map((dataset) => ({
              ...dataset,
              backgroundColor:
                dataset.backgroundColor ||
                data.labels.map(
                  (_, i) => colorPalette[i % colorPalette.length]
                ),
              borderColor: dataset.borderColor || "#1b1b1b",
              borderWidth: dataset.borderWidth || 1,
            })),
          };
        };

        setExpenseNamesData(assignColors(byNameRes.data));
        setMonthlyExpensesData({
          ...monthlyRes.data,
          datasets: monthlyRes.data.datasets.map((dataset) => ({
            ...dataset,
            backgroundColor: dataset.backgroundColor || "#4ECDC4",
            borderColor: dataset.borderColor || "#4ECDC4",
            borderWidth: dataset.borderWidth || 1,
          })),
        });
        setExpenseTrendData({
          ...trendRes.data,
          datasets: trendRes.data.datasets.map((dataset) => ({
            ...dataset,
            fill: false,
            borderColor: dataset.borderColor || "#FF6B6B",
            tension: 0.4,
            pointBackgroundColor: dataset.pointBackgroundColor || "#FF6B6B",
          })),
        });
        setPaymentMethodData(assignColors(paymentMethodsRes.data));
        setCumulativeExpensesData({
          ...cumulativeRes.data,
          datasets: cumulativeRes.data.datasets.map((dataset) => ({
            ...dataset,
            fill: true,
            backgroundColor:
              dataset.backgroundColor || "rgba(150, 206, 180, 0.5)",
            borderColor: dataset.borderColor || "#96CEB4",
            tension: 0.4,
          })),
        });
        setExpenseOverTimeData(assignColors(nameOverTimeRes.data, true));
        setError(null);
      } catch (error) {
        console.error("Error fetching expense data:", error);
        setError("Failed to load dashboard data. Please try again.");
      }
    };

    fetchData();
  }, [token,friendId]);

  // Remove legend for all screens
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        labels: { color: "#ffffff", font: { size: 14 } },
      },
      title: { display: true, color: "#ffffff", font: { size: 16 } },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#ffffff",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: "#ffffff" },
        grid: { color: "#2a2a2a" },
        stacked: true,
      },
      y: {
        ticks: { color: "#ffffff" },
        grid: { color: "#2a2a2a" },
        stacked: true,
      },
    },
  };

  const polarAreaOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: "Payment Method Distribution",
        color: "#ffffff",
        font: { size: 16 },
      },
    },
    scales: {
      r: {
        ticks: { color: "#ffffff", display: false },
        grid: { color: "#2a2a2a" },
        angleLines: { color: "#2a2a2a" },
        pointLabels: { color: "#ffffff" },
      },
    },
  };

  const containerStyle = {
    width: isMobile ? "100vw" : "calc(100vw - 370px)",
    height: isMobile ? "100%" : "calc(100vh - 100px)",
    backgroundColor: "#0b0b0b",
    borderRadius: "8px",
    border: "1px solid #000",
    marginRight: isMobile ? 0 : "20px",
    display: "flex",
    flexDirection: "column",
  };

  const headerStyle = {
    width: isMobile ? "100vw" : "calc(100vw - 370px)",
    height: "50px",
    backgroundColor: "#1b1b1b",
  };

  const chartHeight = isMobile ? 200 : 250;
  const chartCardBg = isMobile ? "#1b1b1b" : "#1b1b1b";

  return (
    <>
      {/* <div style={headerStyle}></div> */}

      <div className="flex flex-col p-4" style={containerStyle}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between", // Positions the back button on the left and text in the center
            alignItems: "center",
            mb: 1,
          }}
        >
          {/* Left Section: Back Button */}
          <IconButton
            sx={{
              color: "#00DAC6",
              backgroundColor: "#1b1b1b",
              "&:hover": {
                backgroundColor: "#28282a",
              },
              zIndex: 10,
            }}
            onClick={() =>
              friendId && friendId !== "undefined"
                ? navigate(`/friends/expenses/${friendId}`)
                : navigate("/expenses")
            }
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

          {/* Center Section: Text */}
          <Typography
            variant={isSmallScreen ? "h5" : "h3"} // Reduce font size on small screens
            sx={{
              color: "#ffffff",
              fontWeight: "bold",
              textAlign: "center", // Ensures the text is centered
              flex: 1, // Allows the text to take up the remaining space
            }}
          >
            Expense Dashboard
          </Typography>
        </Box>
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full flex-1 bg-[#0b0b0b]">
          <div
            className="p-4 rounded-lg shadow-lg flex flex-col items-center"
            style={{ backgroundColor: chartCardBg }}
          >
            <div className="w-full" style={{ height: chartHeight }}>
              {expenseNamesData ? (
                <Pie
                  data={expenseNamesData}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        ...chartOptions.plugins.title,
                        text: "Expenses by Name",
                      },
                    },
                  }}
                />
              ) : (
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={chartHeight}
                  animation="wave"
                  sx={{ bgcolor: "#2a2a2a" }}
                />
              )}
            </div>
          </div>
          <div
            className="p-4 rounded-lg shadow-lg flex flex-col items-center"
            style={{ backgroundColor: chartCardBg }}
          >
            <div className="w-full" style={{ height: chartHeight }}>
              {monthlyExpensesData ? (
                <Bar
                  data={monthlyExpensesData}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        ...chartOptions.plugins.title,
                        text: "Monthly Expenses",
                      },
                    },
                  }}
                />
              ) : (
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={chartHeight}
                  animation="wave"
                  sx={{ bgcolor: "#2a2a2a" }}
                />
              )}
            </div>
          </div>
          <div
            className="p-4 rounded-lg shadow-lg flex flex-col items-center"
            style={{ backgroundColor: chartCardBg }}
          >
            <div className="w-full" style={{ height: chartHeight }}>
              {expenseTrendData ? (
                <Line
                  data={expenseTrendData}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        ...chartOptions.plugins.title,
                        text: "Expense Trend",
                      },
                    },
                  }}
                />
              ) : (
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={chartHeight}
                  animation="wave"
                  sx={{ bgcolor: "#2a2a2a" }}
                />
              )}
            </div>
          </div>
          <div
            className="p-4 rounded-lg shadow-lg flex flex-col items-center"
            style={{ backgroundColor: chartCardBg }}
          >
            <div className="w-full" style={{ height: chartHeight }}>
              {paymentMethodData ? (
                <PolarArea
                  data={paymentMethodData}
                  options={polarAreaOptions}
                />
              ) : (
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={chartHeight}
                  animation="wave"
                  sx={{ bgcolor: "#2a2a2a" }}
                />
              )}
            </div>
          </div>
          <div
            className="p-4 rounded-lg shadow-lg flex flex-col items-center"
            style={{ backgroundColor: chartCardBg }}
          >
            <div className="w-full" style={{ height: chartHeight }}>
              {cumulativeExpensesData ? (
                <Line
                  data={cumulativeExpensesData}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        ...chartOptions.plugins.title,
                        text: "Cumulative Expenses",
                      },
                    },
                  }}
                />
              ) : (
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={chartHeight}
                  animation="wave"
                  sx={{ bgcolor: "#2a2a2a" }}
                />
              )}
            </div>
          </div>
          <div
            className="p-4 rounded-lg shadow-lg flex flex-col items-center"
            style={{ backgroundColor: chartCardBg }}
          >
            <div className="w-full" style={{ height: chartHeight }}>
              {expenseOverTimeData ? (
                <Bar
                  data={expenseOverTimeData}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        ...chartOptions.plugins.title,
                        text: "Expenses by Name Over Times",
                      },
                    },
                  }}
                />
              ) : (
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={chartHeight}
                  animation="wave"
                  sx={{ bgcolor: "#2a2a2a" }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreditDueContent;
