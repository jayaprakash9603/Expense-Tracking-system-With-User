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

const MonthlyReport = () => {
  const [dailySpendingData, setDailySpendingData] = useState([]);
  const [monthlySpendingIncomeData, setMonthlySpendingIncomeData] = useState(
    []
  );
  const [pieData, setPieData] = useState([]);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("jwt");

  // Color palette for charts
  const colorPalette = ["#8884d8", "#82ca9d", "#ff7300", "#FF6B6B", "#4ECDC4"];

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

        setDailySpendingData(spendingRes.data);
        setMonthlySpendingIncomeData(totalsRes.data);
        setPieData(distributionRes.data);
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

  // Custom label renderer for Pie Chart to ensure white text
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="#ffffff"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        style={{ fontSize: 12 }}
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  return (
    <div
      style={{
        marginTop: "20px",
        width: "1460px",
        height: "250px",
        borderRadius: "8px",
        border: "1px solid rgb(80, 80, 80)",
        backgroundColor: "rgb(27, 27, 27)",
        boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
        // padding: "16px",
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
          height: "80%",
        }}
      >
        {/* Line Chart - Daily Spending */}
        <div
          style={{
            flex: "1 1 30%",
            minWidth: "300px",
            marginRight: "20px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <p
            style={{
              color: "#ffffff",
              fontWeight: "bold",
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            Daily Spending (May 2025)
          </p>
          <ResponsiveContainer width="100%" height="80%">
            {dailySpendingData.length > 0 ? (
              <LineChart data={dailySpendingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis
                  dataKey="day"
                  stroke="#ffffff"
                  tick={{ fill: "#ffffff" }}
                  tickFormatter={(value) => value.split("-")[2]}
                />
                <YAxis stroke="#ffffff" tick={{ fill: "#ffffff" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#333",
                    border: "1px solid #444",
                    color: "#ffffff",
                  }}
                  itemStyle={{ color: "#ffffff" }}
                />
                <Legend wrapperStyle={{ color: "#ffffff" }} />
                <Line
                  type="monotone"
                  dataKey="spending"
                  stroke="#FF6B6B"
                  name="Spending"
                />
              </LineChart>
            ) : (
              <p style={{ color: "#ffffff", textAlign: "center" }}>
                {error ? "Error loading data" : "Loading..."}
              </p>
            )}
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Monthly Spending vs Income */}
        <div
          style={{
            flex: "1 1 30%",
            minWidth: "300px",
            marginRight: "20px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <p
            style={{
              color: "#ffffff",
              fontWeight: "bold",
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            Monthly Spending vs Income (May 2025)
          </p>
          <ResponsiveContainer width="100%" height="80%">
            {monthlySpendingIncomeData.length > 0 ? (
              <BarChart data={monthlySpendingIncomeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis
                  dataKey="name"
                  stroke="#ffffff"
                  tick={{ fill: "#ffffff" }}
                />
                <YAxis stroke="#ffffff" tick={{ fill: "#ffffff" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#333",
                    border: "1px solid #444",
                    color: "#ffffff",
                  }}
                  itemStyle={{ color: "#ffffff" }}
                />
                <Legend wrapperStyle={{ color: "#ffffff" }} />
                <Bar dataKey="value" name="Amount">
                  {monthlySpendingIncomeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.name === "Spending" ? "#FF6B6B" : "#4ECDC4"}
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <p style={{ color: "#ffffff", textAlign: "center" }}>
                {error ? "Error loading data" : "Loading..."}
              </p>
            )}
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Expense Distribution */}
        <div
          style={{
            flex: "1 1 30%",
            minWidth: "300px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <p
            style={{
              color: "#ffffff",
              fontWeight: "bold",
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            Expense Distribution (May 2025)
          </p>
          <ResponsiveContainer width="100%" height="80%">
            {pieData.length > 0 ? (
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
                      fill={colorPalette[index % colorPalette.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#333",
                    border: "1px solid #444",
                    color: "#ffffff",
                  }}
                  itemStyle={{ color: "#ffffff" }}
                />
              </PieChart>
            ) : (
              <p style={{ color: "#ffffff", textAlign: "center" }}>
                {error ? "Error loading data" : "Loading..."}
              </p>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;
