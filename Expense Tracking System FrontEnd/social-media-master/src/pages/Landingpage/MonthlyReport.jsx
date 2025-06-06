import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { API_BASE_URL } from "../../config/api";
import { useTheme, useMediaQuery } from "@mui/material";

const MonthlyReport = () => {
  const [dailySpendingData, setDailySpendingData] = useState([]);
  const [monthlySpendingIncomeData, setMonthlySpendingIncomeData] = useState(
    []
  );
  const [pieData, setPieData] = useState([]);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("jwt");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Color palette for charts
  const colorPalette = ["#8884d8", "#82ca9d", "#ff7300", "#FF6B6B", "#4ECDC4"];

  // Default datasets for empty responses
  const defaultDailySpending = Array.from({ length: 31 }, (_, i) => ({
    day: `2025-05-${String(i + 1).padStart(2, "0")}`,
    spending: 0,
  }));
  const defaultMonthlySpendingIncome = [{ name: "No Expenses", value: 0 }];
  const defaultPieData = [{ name: "No Expenses", value: 1 }];

  // Truncate long names
  const truncate = (str, maxLength = 20) =>
    str.length > maxLength ? `${str.slice(0, maxLength - 3)}...` : str;

  useEffect(() => {
    if (!token) {
      setError("Please log in to view the monthly report.");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    const fetchData = async () => {
      try {
        const [spendingRes, totalsRes, distributionRes] = await Promise.all([
          axios.get(
            `${API_BASE_URL}/api/expenses/current-month/daily-spending`,
            { headers }
          ),
          axios.get(`${API_BASE_URL}/api/expenses/current-month/totals`, {
            headers,
          }),
          axios.get(`${API_BASE_URL}/api/expenses/current-month/distribution`, {
            headers,
          }),
        ]);
        setDailySpendingData(
          spendingRes.data.length > 0 ? spendingRes.data : defaultDailySpending
        );
        setMonthlySpendingIncomeData(
          totalsRes.data.length > 0
            ? totalsRes.data.map((item) => ({
                ...item,
                name: truncate(item.name),
              }))
            : defaultMonthlySpendingIncome
        );
        setPieData(
          distributionRes.data.length > 0
            ? distributionRes.data.map((item) => ({
                ...item,
                name: truncate(item.name),
              }))
            : defaultPieData
        );
        setError(null);
      } catch (error) {
        console.error("Error fetching monthly report data:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("jwt");
          window.location.href = "/login";
        } else {
          setError("Failed to load monthly report. Please try again.");
        }
      }
    };

    fetchData();
  }, [token]);

  // Custom label renderer for Pie Chart with truncated names
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 1.1;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
    return (
      <text
        x={x}
        y={y}
        fill="#ffffff"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        style={{ fontSize: 10 }}
      >
        {`${truncate(name)} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  // Custom XAxis tick for BarChart
  const CustomTick = ({ x, y, payload }) => (
    <text
      x={x}
      y={y + 10}
      fill="#ffffff"
      textAnchor="middle"
      style={{ fontSize: 12 }}
    >
      {truncate(payload.value)}
    </text>
  );

  // Custom tooltip with truncated names
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#333",
            border: "1px solid #444",
            padding: "8px",
            color: "#ffffff",
            borderRadius: "4px",
          }}
        >
          <p>{truncate(label || payload[0].name)}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color || "#ffffff" }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Add a utility function to get the current month and year dynamically
  const getCurrentMonthYear = () => {
    const date = new Date();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    return `${month} ${year}`;
  };

  return (
    <div
      style={{
        marginTop: "30px",
        width: isMobile ? "90vw" : "100%",
        maxWidth: isMobile ? "90vw" : "1460px",
        height: isMobile ? "100vh" : "270px",
        borderRadius: "8px",
        border: "1px solid rgb(80, 80, 80)",
        backgroundColor: "rgb(27, 27, 27)",
        boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
        padding: "10px",
        boxSizing: "border-box",
      }}
    >
      {error && (
        <div
          style={{
            color: "#ffffff",
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px",
          flexWrap: "wrap",
          height: isMobile ? "100vh" : "80%",
        }}
      >
        {/* Line Chart - Daily Spending */}
        <div
          style={{
            flex: "1 1 30%",
            minWidth: isMobile ? "300px" : "300px",
            marginRight: "20px",
            height: isMobile ? "30%" : "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          {!isMobile && (
            <p
              style={{
                color: "#ffffff",
                fontWeight: "bold",
                marginBottom: "10px",
                textAlign: "center",
              }}
            >
              Daily Spending ({getCurrentMonthYear()})
            </p>
          )}
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={dailySpendingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis
                dataKey="day"
                stroke="#ffffff"
                tick={{ fill: "#ffffff" }}
                tickFormatter={(value) => value.split("-")[2]}
              />
              <YAxis stroke="#ffffff" tick={{ fill: "#ffffff" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: "#ffffff" }} />
              <Line
                type="monotone"
                dataKey="spending"
                stroke="#FF6B6B"
                name="Spending"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Monthly Spending vs Income */}
        <div
          style={{
            flex: "1 1 30%",
            minWidth: "300px",
            marginRight: "20px",
            height: isMobile ? "30%" : "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          {!isMobile && (
            <p
              style={{
                color: "#ffffff",
                fontWeight: "bold",
                marginBottom: "10px",
                textAlign: "center",
              }}
            >
              Monthly Spending vs Income ({getCurrentMonthYear()})
            </p>
          )}
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={monthlySpendingIncomeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#ffffff" tick={<CustomTick />} />
              <YAxis stroke="#ffffff" tick={{ fill: "#ffffff" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: "#ffffff" }} />
              <Bar dataKey="value" name="Amount">
                {monthlySpendingIncomeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.name === "No Expenses"
                        ? "#8884d8"
                        : entry.name === "Spending"
                        ? "#FF6B6B"
                        : "#4ECDC4"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Expense Distribution */}
        <div
          style={{
            flex: "1 1 30%",
            minWidth: "300px",
            height: isMobile ? "30%" : "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          {!isMobile && (
            <p
              style={{
                color: "#ffffff",
                fontWeight: "bold",
                marginBottom: "10px",
                textAlign: "center",
              }}
            >
              Expense Distribution ({getCurrentMonthYear()})
            </p>
          )}
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={60}
                label={renderCustomLabel}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.name === "No Expenses"
                        ? "#8884d8"
                        : colorPalette[index % colorPalette.length]
                    }
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;
