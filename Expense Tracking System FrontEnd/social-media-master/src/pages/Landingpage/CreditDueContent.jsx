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
import { Skeleton } from "@mui/material"; // Import MUI Skeleton
import { API_BASE_URL } from "../../config/api";

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
  const [expenseNamesData, setExpenseNamesData] = useState(null);
  const [monthlyExpensesData, setMonthlyExpensesData] = useState(null);
  const [expenseTrendData, setExpenseTrendData] = useState(null);
  const [paymentMethodData, setPaymentMethodData] = useState(null);
  const [cumulativeExpensesData, setCumulativeExpensesData] = useState(null);
  const [expenseOverTimeData, setExpenseOverTimeData] = useState(null);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("jwt");

  // Common color palette for all charts
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

    const year = 2025; // Can be made dynamic via UI
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
          axios.get(`${API_BASE_URL}/api/expenses/by-name?year=${year}`, {
            headers,
          }),
          axios.get(`${API_BASE_URL}/api/expenses/monthly?year=${year}`, {
            headers,
          }),
          axios.get(`${API_BASE_URL}/api/expenses/trend?year=${year}`, {
            headers,
          }),
          axios.get(
            `${API_BASE_URL}/api/expenses/payment-methods?year=${year}`,
            { headers }
          ),
          axios.get(`${API_BASE_URL}/api/expenses/cumulative?year=${year}`, {
            headers,
          }),
          axios.get(
            `${API_BASE_URL}/api/expenses/name-over-time?year=${year}&limit=5`,
            { headers }
          ),
        ]);

        // Assign colors to datasets
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
  }, [token]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#ffffff",
          font: { size: 14 },
        },
      },
      title: {
        display: true,
        color: "#ffffff",
        font: { size: 16 },
      },
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
      datalabels: {
        display: false,
      },
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          label: (context) => `${context.label}: $${context.raw}`,
        },
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

  return (
    <div className="bg-[#1b1b1b] min-h-screen flex flex-col">
      <div
        stadio-div
        className="w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"
      ></div>

      <div
        className="flex flex-col flex-shrink-0 flex-grow-1 p-6 mx-4"
        style={{
          width: "calc(100vw - 370px)",
          backgroundColor: "rgb(11, 11, 11)",
          borderRadius: "8px",
          boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
          border: "1px solid rgb(0, 0, 0)",
          opacity: 1,
        }}
      >
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Expense Dashboard
        </h1>

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full h-full">
          <div className="bg-[#1b1b1b] p-4 rounded-lg shadow-lg flex flex-col items-center">
            <div className="w-full h-72">
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
                  height={288}
                  animation="wave"
                  sx={{ bgcolor: "#2a2a2a" }}
                />
              )}
            </div>
          </div>

          <div className="bg-[#1b1b1b] p-4 rounded-lg shadow-lg flex flex-col items-center">
            <div className="w-full h-72">
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
                  height={288}
                  animation="wave"
                  sx={{ bgcolor: "#2a2a2a" }}
                />
              )}
            </div>
          </div>

          <div className="bg-[#1b1b1b] p-4 rounded-lg shadow-lg flex flex-col items-center">
            <div className="w-full h-72">
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
                  height={288}
                  animation="wave"
                  sx={{ bgcolor: "#2a2a2a" }}
                />
              )}
            </div>
          </div>

          <div className="bg-[#1b1b1b] p-4 rounded-lg shadow-lg flex flex-col items-center">
            <div className="w-full h-72">
              {paymentMethodData ? (
                <PolarArea
                  data={paymentMethodData}
                  options={polarAreaOptions}
                />
              ) : (
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={288}
                  animation="wave"
                  sx={{ bgcolor: "#2a2a2a" }}
                />
              )}
            </div>
          </div>

          <div className="bg-[#1b1b1b] p-4 rounded-lg shadow-lg flex flex-col items-center">
            <div className="w-full h-72">
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
                  height={288}
                  animation="wave"
                  sx={{ bgcolor: "#2a2a2a" }}
                />
              )}
            </div>
          </div>

          <div className="bg-[#1b1b1b] p-4 rounded-lg shadow-lg flex flex-col items-center">
            <div className="w-full h-72">
              {expenseOverTimeData ? (
                <Bar
                  data={expenseOverTimeData}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        ...chartOptions.plugins.title,
                        text: "Expenses by Name Over Time",
                      },
                    },
                  }}
                />
              ) : (
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={288}
                  animation="wave"
                  sx={{ bgcolor: "#2a2a2a" }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div>
    </div>
  );
};

export default CreditDueContent;
