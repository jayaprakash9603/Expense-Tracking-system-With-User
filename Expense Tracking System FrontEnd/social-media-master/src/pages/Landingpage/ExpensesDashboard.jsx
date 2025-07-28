import React, { useState, useEffect, useRef, useMemo } from "react";
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
  const canvasRef = useRef(null);

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

  // Voice command simulation
  const startListening = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      // Simulate voice command result
      alert("Voice command: 'Show my grocery spending' - Feature simulated!");
    }, 3000);
  };

  const accentColors = {
    cyan: "from-cyan-500 to-blue-500",
    pink: "from-pink-500 to-purple-500",
    green: "from-green-500 to-emerald-500",
    orange: "from-orange-500 to-red-500",
  };

  const totalExpenses = expenseData.reduce((sum, item) => sum + item.value, 0);
  const budgetRemaining = 15000 - totalExpenses;
  const budgetProgress = (totalExpenses / 15000) * 100;

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
      <div className="relative z-10 p-6 grid grid-cols-12 gap-6">
        {/* Overview Cards */}
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
                            hoveredChart === index ? "scale(1.05)" : "scale(1)",
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
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
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
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
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
                    style={{ backgroundColor: `rgba(6, 182, 212, ${opacity})` }}
                  ></div>
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesDashboard;
