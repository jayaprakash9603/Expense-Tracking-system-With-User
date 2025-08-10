import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { useTheme, useMediaQuery, Skeleton } from "@mui/material";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Plus,
  Mic,
  MicOff,
  Sun,
  Moon,
  Settings,
  TrendingUp,
  Globe,
  Zap,
  Trophy,
  Target,
  Calendar,
  DollarSign,
  CreditCard,
  ShoppingBag,
  Car,
  Home,
  Utensils,
  Coffee,
} from "lucide-react";
import {
  getExpensesAction,
  getExpensesSuggestions,
  getHomeExpensesAction,
  getExpensesSummaryAction,
} from "../../Redux/Expenses/expense.action";
import { API_BASE_URL } from "../../config/api";

const ExpensesDashboard = () => {
  const [isDark, setIsDark] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [accentColor, setAccentColor] = useState("cyan");
  const [widgets, setWidgets] = useState([
    "overview",
    "chart",
    "insights",
    "goals",
  ]);
  const [hoveredChart, setHoveredChart] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [dailySpendingData, setDailySpendingData] = useState([]);
  const [monthlySpendingIncomeData, setMonthlySpendingIncomeData] = useState(
    []
  );
  const [pieData, setPieData] = useState([]);
  const [error, setError] = useState(null);

  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { summary, loading } = useSelector((state) => state.expenses || {});
  const token = localStorage.getItem("jwt");

  // Real expense data from user
  const expenseData = [
    { name: "Housing", value: 7000, color: "#96ceb4", icon: "🏠" },
    { name: "Bills & Utilities", value: 3586, color: "#feca57", icon: "💡" },
    { name: "Groceries", value: 1080, color: "#4ecdc4", icon: "🛒" },
    { name: "Shopping", value: 342, color: "#ff9ff3", icon: "🛍️" },
    { name: "Food & Dining", value: 220, color: "#ff6b6b", icon: "🍽️" },
    { name: "Investments", value: 64, color: "#a8e6cf", icon: "💰" },
    { name: "Transportation", value: 40, color: "#45b7d1", icon: "🚗" },
  ];

  const monthlyTrend = [
    { month: "Jan", amount: 2800, budget: 15000 },
    { month: "Feb", amount: 2650, budget: 15000 },
    { month: "Mar", amount: 3100, budget: 15000 },
    { month: "Apr", amount: 2900, budget: 15000 },
    { month: "May", amount: 2750, budget: 15000 },
    { month: "Jun", amount: 2880, budget: 15000 },
    { month: "Jul", amount: 12332, budget: 15000 },
  ];

  const dailySpending = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    amount: Math.floor(Math.random() * 200) + 50,
    intensity: Math.random(),
  }));

  const insights = [
    {
      id: 1,
      text: "Housing expenses (₹7000) are your biggest spend this month 🏠",
      type: "warning",
    },
    {
      id: 2,
      text: "Mobile recharge of ₹3586 is a major one-time expense",
      type: "tip",
    },
    {
      id: 3,
      text: "You earned ₹63 from cashback and interest this month! 💰",
      type: "success",
    },
    {
      id: 4,
      text: "Transportation costs are well controlled at just ₹40",
      type: "success",
    },
  ];

  const achievements = [
    {
      id: 1,
      name: "Budget Master",
      icon: "🏆",
      unlocked: true,
      description: "Stay within budget for 3 months",
    },
    {
      id: 2,
      name: "Savings Streak",
      icon: "🔥",
      unlocked: true,
      description: "Save money for 30 days straight",
    },
    {
      id: 3,
      name: "Category King",
      icon: "👑",
      unlocked: false,
      description: "Track expenses in all categories",
    },
    {
      id: 4,
      name: "Future Planner",
      icon: "🚀",
      unlocked: false,
      description: "Set up automatic savings",
    },
  ];

  // Color palette for charts
  const colorPalette = ["#8884d8", "#82ca9d", "#ff7300", "#FF6B6B", "#4ECDC4"];

  // Default datasets for empty responses
  const defaultDailySpending = Array.from({ length: 31 }, (_, i) => ({
    day: `2025-05-${String(i + 1).padStart(2, "0")}`,
    spending: 0,
  }));
  const defaultMonthlySpendingIncome = [{ name: "No Expenses", value: 0 }];
  const defaultPieData = [{ name: "No Expenses", value: 1 }];

  // Get summary data
  const totalExpenses = summary?.currentMonthLosses || 0;
  const todayExpenses = summary?.todayExpenses || 0;
  const creditDue = -summary?.totalCreditDue || 0;
  const remainingBudget = summary?.remainingBudget || 0;
  const lastFiveExpenses = summary?.lastFiveExpenses || [];

  const budgetRemaining = 15000 - totalExpenses;
  const budgetProgress = (totalExpenses / 15000) * 100;

  const accentColors = {
    cyan: "from-cyan-500 to-blue-500",
    pink: "from-pink-500 to-purple-500",
    green: "from-green-500 to-emerald-500",
    orange: "from-orange-500 to-red-500",
  };

  const shimmerKeyframes = {
    "@keyframes shimmer": {
      "0%": { backgroundPosition: "-1000px 0" },
      "100%": { backgroundPosition: "1000px 0" },
    },
  };

  // Utility functions
  const truncate = (str, maxLength = 20) =>
    str.length > maxLength ? `${str.slice(0, maxLength - 3)}...` : str;

  const getCurrentMonthYear = () => {
    const date = new Date();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    return `${month} ${year}`;
  };

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

  // Particle animation for canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const particles = [];

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: Math.random() * 100,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;

        if (
          particle.life <= 0 ||
          particle.x < 0 ||
          particle.x > canvas.width ||
          particle.y < 0 ||
          particle.y > canvas.height
        ) {
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
          particle.life = 100;
        }

        const alpha = particle.life / 100;
        ctx.fillStyle = `rgba(0, 255, 255, ${alpha * 0.3})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 1, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  // Fetch monthly report data
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

  // Voice command simulation
  const startListening = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      alert("Voice command: 'Show my grocery spending' - Feature simulated!");
    }, 3000);
  };

  // Quick access handlers
  const handleClick = (route) => {
    if (route === "/expenses") {
      dispatch(getExpensesSuggestions());
    }
    if (route === "/budget/create") {
      navigate("/budget/create");
    }
    navigate(route);
  };

  const handleUploadFileClick = () => {
    dispatch(getHomeExpensesAction());
  };

  // Custom chart components
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

  // Overview Card Component
  const OverviewCard = ({ label, value }) => (
    <div
      style={{
        backgroundColor: "#333",
        padding: "10px",
        borderRadius: "8px",
        textAlign: "center",
        height: "85px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <p
        style={{
          fontSize: "12px",
          marginBottom: "4px",
          color: "#ffffff",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "16px",
          fontWeight: "bold",
          margin: 0,
          color: "#ffffff",
        }}
      >
        {value}
      </p>
    </div>
  );

  const skeletonStyle = {
    ...shimmerKeyframes,
    bgcolor: "rgb(27, 27, 27)",
    backgroundImage:
      "linear-gradient(90deg, rgb(27, 27, 27) 0%, rgb(51, 51, 51) 50%, rgb(27, 27, 27) 100%)",
    backgroundSize: "1000px 100%",
    animation: "shimmer 2s infinite linear",
    borderRadius: "8px",
  };

  return (
    <div
      className={`min-h-screen transition-all duration-1000 ${
        isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      } relative overflow-hidden`}
    >
      {/* Animated background canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        width={window.innerWidth}
        height={window.innerHeight}
      />

      {/* Header */}
      <div
        className={`relative z-10 backdrop-blur-sm ${
          isDark ? "bg-gray-900/80" : "bg-white/80"
        } border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
      >
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-r ${accentColors[accentColor]} flex items-center justify-center`}
            >
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                ExpenseVision Pro
              </h1>
              <p
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Your AI-Powered Financial Command Center
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Voice Command Button */}
            <button
              onClick={startListening}
              className={`relative p-3 rounded-full transition-all duration-300 ${
                isListening
                  ? "bg-red-500 animate-pulse"
                  : `bg-gradient-to-r ${accentColors[accentColor]} hover:scale-110`
              }`}
            >
              {isListening ? (
                <MicOff className="w-5 h-5 text-white" />
              ) : (
                <Mic className="w-5 h-5 text-white" />
              )}
              {isListening && (
                <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30"></div>
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-3 rounded-full bg-gradient-to-r ${accentColors[accentColor]} hover:scale-110 transition-all duration-300`}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-white" />
              ) : (
                <Moon className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Color Picker */}
            <div className="flex space-x-2">
              {Object.keys(accentColors).map((color) => (
                <button
                  key={color}
                  onClick={() => setAccentColor(color)}
                  className={`w-8 h-8 rounded-full bg-gradient-to-r ${
                    accentColors[color]
                  } ${
                    accentColor === color
                      ? "ring-4 ring-white ring-opacity-50"
                      : ""
                  } hover:scale-110 transition-all duration-300`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="relative z-10 p-6 space-y-6">
        {/* Quick Access Section */}
        <div
          style={{
            width: isMobile ? "90vw" : "100%",
            maxWidth: "1460px",
            height: isMobile ? "auto" : "170px",
            borderRadius: "8px",
            backgroundColor: "rgb(27, 27, 27)",
            boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
            border: "1px solid rgb(56, 56, 56)",
            opacity: 1,
            padding: "16px",
            boxSizing: "border-box",
          }}
        >
          <div style={{ width: "100%" }}>
            <p
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: "18px",
                marginBottom: "2px",
              }}
            >
              Quick Access
            </p>
            <hr
              style={{
                border: "none",
                borderTop: "1px solid rgb(80, 80, 80)",
                width: "100%",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: "center",
              justifyContent: isMobile ? "center" : "space-around",
              gap: isMobile ? "16px" : "0px",
              marginTop: "16px",
            }}
          >
            <div
              style={{
                backgroundColor: "#29282b",
                width: isMobile ? "100%" : "220px",
                height: "80px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                gap: "4px",
              }}
              onClick={() => handleClick("/expenses/create")}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#f11f99",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/128/5501/5501384.png"
                  alt="Expense Icon"
                  style={{ width: "24px", height: "24px" }}
                />
              </div>
              <div style={{ color: "white", fontWeight: "bold" }}>
                + New Expense
              </div>
            </div>
            <div
              style={{
                backgroundColor: "#29282b",
                width: isMobile ? "100%" : "220px",
                height: "80px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                gap: "4px",
              }}
              onClick={() => handleClick("/create")}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#222255",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/128/5501/5501384.png"
                  alt="Expense Icon"
                  style={{ width: "24px", height: "24px" }}
                />
              </div>
              <div style={{ color: "white", fontWeight: "bold" }}>
                + New Expense
              </div>
            </div>
            <div
              style={{
                backgroundColor: "#29282b",
                width: isMobile ? "100%" : "220px",
                height: "80px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                gap: "4px",
              }}
              onClick={() => {
                handleClick("/upload");
                handleUploadFileClick();
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#124241",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/128/5501/5501384.png"
                  alt="Expense Icon"
                  style={{ width: "24px", height: "24px" }}
                />
              </div>
              <div style={{ color: "white", fontWeight: "bold" }}>
                + Upload File
              </div>
            </div>
            <div
              style={{
                backgroundColor: "#29282b",
                width: isMobile ? "100%" : "220px",
                height: "80px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                gap: "4px",
              }}
              onClick={() => handleClick("/budget/create")}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#682b3b",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/128/2488/2488980.png"
                  alt="Budget Icon"
                  style={{ width: "24px", height: "24px" }}
                />
              </div>
              <div style={{ color: "white", fontWeight: "bold" }}>
                + New Budget
              </div>
            </div>
          </div>
        </div>

        {/* Overview and Recent Expenses Row */}
        <div className="grid grid-cols-12 gap-6">
          {/* Financial Overview */}
          <div className="col-span-12 lg:col-span-5">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                backgroundColor: "rgb(27, 27, 27)",
                borderRadius: "8px",
                boxShadow: "rgba(0, 0, 0, 0.08) 0 0 0",
                border: "1px solid rgb(80, 80, 80)",
                padding: "20px",
                color: "#ffffff",
                height: "300px",
                boxSizing: "border-box",
              }}
            >
              <div style={{ width: "100%", marginBottom: "16px" }}>
                <p
                  style={{
                    fontWeight: "bold",
                    fontSize: "18px",
                    marginBottom: "4px",
                    color: "#ffffff",
                  }}
                >
                  Financial Overview
                </p>
                <hr
                  style={{
                    border: "none",
                    borderTop: "1px solid rgb(80, 80, 80)",
                    width: "100%",
                  }}
                />
              </div>

              {loading ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "16px",
                    width: "100%",
                  }}
                >
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      variant="rectangular"
                      width="100%"
                      height={85}
                      sx={skeletonStyle}
                    />
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "16px",
                    width: "100%",
                    height: "auto",
                  }}
                >
                  <OverviewCard
                    label="Total Expenses"
                    value={`${totalExpenses}`}
                  />
                  <OverviewCard
                    label="Remaining"
                    value={`${remainingBudget}`}
                  />
                  <OverviewCard
                    label="Today's Expenses"
                    value={`${todayExpenses}`}
                  />
                  <OverviewCard label="Credit Due" value={`${creditDue}`} />
                </div>
              )}
            </div>
          </div>

          {/* Recent Expenses */}
          <div className="col-span-12 lg:col-span-7">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                width: "100%",
                height: "300px",
                backgroundColor: "rgb(27, 27, 27)",
                borderRadius: "8px",
                border: "1px solid rgb(56, 56, 56)",
                padding: "16px",
                boxSizing: "border-box",
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
                        backgroundColor:
                          hoveredId === id ? "#29282b" : "transparent",
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
                            color:
                              expense?.type === "loss" ? "red" : "limegreen",
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
                          {mapPaymentMethod(
                            expense?.paymentMethod || "Unknown"
                          )}
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
        </div>

        {/* Monthly Report Charts */}
        <div
          style={{
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
                  <XAxis
                    dataKey="name"
                    stroke="#ffffff"
                    tick={<CustomTick />}
                  />
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

        {/* Enhanced Dashboard Sections */}
        <div className="grid grid-cols-12 gap-6">
          {/* Total Expenses with Budget Progress */}
          <div className="col-span-12 lg:col-span-4">
            <div
              className={`p-6 rounded-2xl ${
                isDark ? "bg-gray-800/50" : "bg-white/50"
              } backdrop-blur-sm border ${
                isDark ? "border-gray-700" : "border-gray-200"
              } hover:transform hover:scale-105 transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Total Expenses</h3>
                <TrendingUp className={`w-5 h-5 text-${accentColor}-400`} />
              </div>
              <div className="text-3xl font-bold mb-2">
                ${totalExpenses.toLocaleString()}
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  This month
                </span>
                <span className="text-green-400 text-sm">↓ 5.2%</span>
              </div>

              {/* Budget Progress Ring */}
              <div className="mt-6 flex items-center justify-center">
                <div className="relative">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke={isDark ? "#374151" : "#e5e7eb"}
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 40 * (1 - budgetProgress / 100)
                      }`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient
                        id="gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold">
                      {Math.round(budgetProgress)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3D Pie Chart */}
          <div className="col-span-12 lg:col-span-8">
            <div
              className={`p-6 rounded-2xl ${
                isDark ? "bg-gray-800/50" : "bg-white/50"
              } backdrop-blur-sm border ${
                isDark ? "border-gray-700" : "border-gray-200"
              } hover:transform hover:scale-105 transition-all duration-300`}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-cyan-400" />
                Expense Categories
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      innerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                      onMouseEnter={(_, index) => setHoveredChart(index)}
                      onMouseLeave={() => setHoveredChart(null)}
                    >
                      {expenseData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          style={{
                            filter:
                              hoveredChart === index
                                ? "drop-shadow(0 0 10px currentColor)"
                                : "none",
                            transform:
                              hoveredChart === index
                                ? "scale(1.05)"
                                : "scale(1)",
                            transformOrigin: "center",
                            transition: "all 0.3s ease",
                          }}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Legend */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                {expenseData.map((category, index) => (
                  <div
                    key={category.name}
                    className="flex items-center space-x-2"
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="text-sm">
                      {category.icon} {category.name}
                    </span>
                    <span className="text-sm font-bold ml-auto">
                      ${category.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="col-span-12 lg:col-span-8">
            <div
              className={`p-6 rounded-2xl ${
                isDark ? "bg-gray-800/50" : "bg-white/50"
              } backdrop-blur-sm border ${
                isDark ? "border-gray-700" : "border-gray-200"
              } hover:transform hover:scale-105 transition-all duration-300`}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                Spending Trends & Predictions
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrend}>
                    <defs>
                      <linearGradient
                        id="colorSpending"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#06b6d4"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#06b6d4"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorBudget"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Area
                      type="monotone"
                      dataKey="budget"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorBudget)"
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorSpending)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* AI Insights Panel */}
          <div className="col-span-12 lg:col-span-4">
            <div
              className={`p-6 rounded-2xl ${
                isDark ? "bg-gray-800/50" : "bg-white/50"
              } backdrop-blur-sm border ${
                isDark ? "border-gray-700" : "border-gray-200"
              } hover:transform hover:scale-105 transition-all duration-300`}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                AI Smart Insights
              </h3>
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div
                    key={insight.id}
                    className={`p-4 rounded-xl border-l-4 ${
                      insight.type === "success"
                        ? "border-green-400 bg-green-400/10"
                        : insight.type === "warning"
                        ? "border-yellow-400 bg-yellow-400/10"
                        : "border-blue-400 bg-blue-400/10"
                    } animate-pulse`}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <p className="text-sm">{insight.text}</p>
                  </div>
                ))}
              </div>

              {/* Achievements */}
              <div className="mt-6">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
                  Achievements
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-3 rounded-lg text-center transition-all duration-300 ${
                        achievement.unlocked
                          ? `bg-gradient-to-r ${accentColors[accentColor]} text-white hover:scale-105`
                          : `${
                              isDark ? "bg-gray-700/50" : "bg-gray-200/50"
                            } opacity-50`
                      }`}
                    >
                      <div className="text-2xl mb-1">{achievement.icon}</div>
                      <div className="text-xs font-medium">
                        {achievement.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Spending Heatmap */}
          <div className="col-span-12">
            <div
              className={`p-6 rounded-2xl ${
                isDark ? "bg-gray-800/50" : "bg-white/50"
              } backdrop-blur-sm border ${
                isDark ? "border-gray-700" : "border-gray-200"
              } hover:transform hover:scale-105 transition-all duration-300`}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-red-400" />
                Daily Spending Heatmap
              </h3>
              <div className="grid grid-cols-10 gap-1">
                {dailySpending.map((day, index) => (
                  <div
                    key={index}
                    className={`h-8 rounded cursor-pointer transition-all duration-300 hover:scale-110 flex items-center justify-center text-xs font-bold`}
                    style={{
                      backgroundColor: `rgba(6, 182, 212, ${day.intensity})`,
                      color: day.intensity > 0.5 ? "white" : "black",
                    }}
                    title={`Day ${day.day}: $${day.amount}`}
                  >
                    {day.day}
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                <span>Less</span>
                <div className="flex space-x-1">
                  {[0.1, 0.3, 0.5, 0.7, 0.9].map((opacity) => (
                    <div
                      key={opacity}
                      className="w-4 h-4 rounded"
                      style={{
                        backgroundColor: `rgba(6, 182, 212, ${opacity})`,
                      }}
                    ></div>
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className={`fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r ${accentColors[accentColor]} shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group z-50`}
      >
        <Plus className="w-8 h-8 text-white group-hover:rotate-90 transition-transform duration-300" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-20 animate-pulse"></div>
      </button>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md p-6 rounded-2xl ${
              isDark ? "bg-gray-800" : "bg-white"
            } border ${
              isDark ? "border-gray-700" : "border-gray-200"
            } transform animate-in fade-in slide-in-from-bottom-4 duration-300`}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Quick Add Expense
            </h3>

            <div className="space-y-4">
              <input
                type="number"
                placeholder="Amount ($)"
                className={`w-full p-3 rounded-xl border ${
                  isDark
                    ? "border-gray-600 bg-gray-700"
                    : "border-gray-300 bg-white"
                } focus:ring-2 focus:ring-cyan-400 transition-all duration-300`}
              />

              <select
                className={`w-full p-3 rounded-xl border ${
                  isDark
                    ? "border-gray-600 bg-gray-700"
                    : "border-gray-300 bg-white"
                } focus:ring-2 focus:ring-cyan-400 transition-all duration-300`}
              >
                <option>Select Category</option>
                {expenseData.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Description (optional)"
                className={`w-full p-3 rounded-xl border ${
                  isDark
                    ? "border-gray-600 bg-gray-700"
                    : "border-gray-300 bg-white"
                } focus:ring-2 focus:ring-cyan-400 transition-all duration-300`}
              />

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`flex-1 p-3 rounded-xl border ${
                    isDark ? "border-gray-600" : "border-gray-300"
                  } hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    alert("🎉 Expense added successfully!");
                  }}
                  className={`flex-1 p-3 rounded-xl bg-gradient-to-r ${accentColors[accentColor]} text-white hover:scale-105 transition-all duration-300`}
                >
                  Add Expense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesDashboard;
