import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  IconButton,
  Tooltip,
  LinearProgress,
  CircularProgress,
  Box,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Analytics,
  Download,
  Schedule,
  AutoGraph,
  PieChart,
  TrendingUp,
  TrendingDown,
  Star,
  Psychology,
  SmartToy,
  Warning,
  Lightbulb,
  CheckCircle,
  CompareArrows,
  CalendarToday,
  Dashboard,
  NotificationsActive,
  AlarmOn,
  Report,
  MonetizationOn,
  Sync,
  CloudUpload,
  Remove,
  Notifications,
  Security,
  Visibility,
  EmojiEvents,
  Timeline,
} from "@mui/icons-material";

const AnalyticsDashboard = ({ dummyStats }) => {
  return (
    <div className="space-y-8">
      {/* Analytics Header with Quick Stats */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Typography
            variant="h4"
            sx={{ color: "white", fontWeight: "bold", mb: 1 }}
          >
            Financial Analytics Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: "#aaa" }}>
            Comprehensive insights into your financial behavior and patterns
          </Typography>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outlined"
            size="small"
            startIcon={<Download />}
            sx={{
              borderColor: "#14b8a6",
              color: "#14b8a6",
              "&:hover": {
                borderColor: "#0d9488",
                backgroundColor: "rgba(20, 184, 166, 0.1)",
              },
            }}
          >
            Export Report
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Schedule />}
            sx={{
              borderColor: "#14b8a6",
              color: "#14b8a6",
              "&:hover": {
                borderColor: "#0d9488",
                backgroundColor: "rgba(20, 184, 166, 0.1)",
              },
            }}
          >
            Schedule Report
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Analytics />}
            sx={{
              backgroundColor: "#14b8a6",
              color: "#0b0b0b",
              "&:hover": { backgroundColor: "#0d9488" },
            }}
          >
            AI Insights
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            title: "Spending Velocity",
            value: "$127.50",
            subtitle: "per day",
            change: "-12.5%",
            trend: "down",
            icon: <AutoGraph />,
            color: "#10b981",
          },
          {
            title: "Budget Efficiency",
            value: "87.3%",
            subtitle: "utilization",
            change: "+5.2%",
            trend: "up",
            icon: <PieChart />,
            color: "#14b8a6",
          },
          {
            title: "Savings Rate",
            value: "23.8%",
            subtitle: "of income",
            change: "+2.1%",
            trend: "up",
            icon: <TrendingUp />,
            color: "#f59e0b",
          },
          {
            title: "Financial Score",
            value: "8.7/10",
            subtitle: "excellent",
            change: "+0.3",
            trend: "up",
            icon: <Star />,
            color: "#8b5cf6",
          },
        ].map((kpi, index) => (
          <Card
            key={index}
            sx={{
              backgroundColor: "#1a1a1a",
              border: "1px solid rgba(20, 184, 166, 0.3)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <CardContent>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${kpi.color}20` }}
                  >
                    {React.cloneElement(kpi.icon, {
                      sx: { color: kpi.color, fontSize: "1.5rem" },
                    })}
                  </div>
                </div>
                <Chip
                  label={kpi.change}
                  size="small"
                  sx={{
                    backgroundColor:
                      kpi.trend === "up" ? "#10b98120" : "#ef444420",
                    color: kpi.trend === "up" ? "#10b981" : "#ef4444",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                  }}
                />
              </div>
              <Typography
                variant="h4"
                sx={{ color: "white", fontWeight: "bold", mb: 1 }}
              >
                {kpi.value}
              </Typography>
              <Typography variant="body2" sx={{ color: "#aaa", mb: 2 }}>
                {kpi.title}
              </Typography>
              <Typography variant="caption" sx={{ color: kpi.color }}>
                {kpi.subtitle}
              </Typography>
            </CardContent>
            {/* Animated background gradient */}
            <div
              className="absolute bottom-0 left-0 right-0 h-1"
              style={{
                background: `linear-gradient(90deg, ${kpi.color}00 0%, ${kpi.color} 50%, ${kpi.color}00 100%)`,
                animation: "shimmer 6s ease-in-out infinite",
              }}
            />
          </Card>
        ))}
      </div>

      {/* Advanced Spending Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Spending Heatmap */}
        <Card
          sx={{
            backgroundColor: "#1a1a1a",
            border: "1px solid rgba(20, 184, 166, 0.3)",
          }}
        >
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Typography
                variant="h6"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                Spending Heatmap
              </Typography>
              <Tooltip title="Shows spending intensity by day and time">
                <IconButton size="small">
                  <Psychology sx={{ color: "#14b8a6", fontSize: "1rem" }} />
                </IconButton>
              </Tooltip>
            </div>

            {/* Heatmap Grid */}
            <div className="space-y-2">
              <div className="grid grid-cols-7 gap-1 text-xs text-center text-gray-400 mb-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day) => (
                    <div key={day}>{day}</div>
                  )
                )}
              </div>
              {Array.from({ length: 4 }, (_, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const intensity = Math.random();
                    return (
                      <Tooltip
                        key={dayIndex}
                        title={`$${(intensity * 200).toFixed(2)} spent`}
                      >
                        <div
                          className="h-8 rounded cursor-pointer transition-all hover:scale-110"
                          style={{
                            backgroundColor:
                              intensity > 0.7
                                ? "#ef4444"
                                : intensity > 0.4
                                ? "#f59e0b"
                                : intensity > 0.2
                                ? "#14b8a6"
                                : "#333",
                          }}
                        />
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-4 text-xs">
              <span className="text-gray-400">Less</span>
              <div className="flex gap-1">
                {["#333", "#14b8a6", "#f59e0b", "#ef4444"].map((color, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="text-gray-400">More</span>
            </div>
          </CardContent>
        </Card>

        {/* Expense Velocity Chart */}
        <Card
          sx={{
            backgroundColor: "#1a1a1a",
            border: "1px solid rgba(20, 184, 166, 0.3)",
          }}
        >
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Typography
                variant="h6"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                Expense Velocity
              </Typography>
              <div className="flex gap-2">
                <Chip
                  label="Real-time"
                  size="small"
                  sx={{ backgroundColor: "#10b98120", color: "#10b981" }}
                />
                <Chip
                  label="Live"
                  size="small"
                  sx={{ backgroundColor: "#ef444420", color: "#ef4444" }}
                />
              </div>
            </div>

            {/* Velocity Gauge */}
            <div className="relative flex items-center justify-center mb-4">
              <Box position="relative" display="inline-flex">
                <CircularProgress
                  variant="determinate"
                  value={75}
                  size={120}
                  thickness={8}
                  sx={{
                    color: "#14b8a6",
                    "& .MuiCircularProgress-circle": {
                      strokeLinecap: "round",
                    },
                  }}
                />
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={120}
                  thickness={8}
                  sx={{
                    color: "#333",
                    position: "absolute",
                    left: 0,
                    zIndex: -1,
                  }}
                />
                <Box
                  top={0}
                  left={0}
                  bottom={0}
                  right={0}
                  position="absolute"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="column"
                >
                  <Typography
                    variant="h5"
                    sx={{ color: "white", fontWeight: "bold" }}
                  >
                    75%
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#aaa" }}>
                    of budget
                  </Typography>
                </Box>
              </Box>
            </div>

            {/* Velocity Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <Typography
                  variant="h6"
                  sx={{ color: "#14b8a6", fontWeight: "bold" }}
                >
                  $127.50
                </Typography>
                <Typography variant="caption" sx={{ color: "#aaa" }}>
                  Daily Average
                </Typography>
              </div>
              <div className="text-center">
                <Typography
                  variant="h6"
                  sx={{ color: "#f59e0b", fontWeight: "bold" }}
                >
                  18 days
                </Typography>
                <Typography variant="caption" sx={{ color: "#aaa" }}>
                  Budget Runway
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictive Analytics & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Spending Forecast */}
        <Card
          sx={{
            backgroundColor: "#1a1a1a",
            border: "1px solid rgba(20, 184, 166, 0.3)",
          }}
        >
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <SmartToy sx={{ color: "#8b5cf6" }} />
              <Typography
                variant="h6"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                AI Forecast
              </Typography>
            </div>

            {/* Forecast Chart Simulation */}
            <div className="space-y-3">
              {[
                { period: "Next Week", amount: 425, confidence: 92 },
                { period: "Next Month", amount: 1850, confidence: 87 },
                { period: "Next Quarter", amount: 5200, confidence: 73 },
              ].map((forecast, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Typography variant="body2" sx={{ color: "white" }}>
                      {forecast.period}
                    </Typography>
                    <div className="text-right">
                      <Typography
                        variant="body2"
                        sx={{ color: "#14b8a6", fontWeight: "bold" }}
                      >
                        ${forecast.amount.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#aaa" }}>
                        {forecast.confidence}% confidence
                      </Typography>
                    </div>
                  </div>
                  <LinearProgress
                    variant="determinate"
                    value={forecast.confidence}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: "#333",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: `hsl(${
                          forecast.confidence * 1.2
                        }, 70%, 50%)`,
                      },
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Anomaly Detection */}
        <Card
          sx={{
            backgroundColor: "#1a1a1a",
            border: "1px solid rgba(20, 184, 166, 0.3)",
          }}
        >
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Warning sx={{ color: "#f59e0b" }} />
              <Typography
                variant="h6"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                Anomalies
              </Typography>
            </div>

            <div className="space-y-3">
              {[
                {
                  type: "Unusual Spending",
                  description: "300% increase in dining expenses",
                  severity: "high",
                  date: "2 days ago",
                },
                {
                  type: "New Merchant",
                  description: "First time purchase at TechStore",
                  severity: "medium",
                  date: "1 week ago",
                },
                {
                  type: "Budget Deviation",
                  description: "Entertainment budget exceeded by 45%",
                  severity: "low",
                  date: "3 days ago",
                },
              ].map((anomaly, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-[#0b0b0b] border-l-4"
                  style={{
                    borderLeftColor:
                      anomaly.severity === "high"
                        ? "#ef4444"
                        : anomaly.severity === "medium"
                        ? "#f59e0b"
                        : "#14b8a6",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "white", fontWeight: "500" }}
                  >
                    {anomaly.type}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "#aaa", display: "block", mb: 1 }}
                  >
                    {anomaly.description}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#666" }}>
                    {anomaly.date}
                  </Typography>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Optimization Suggestions */}
        <Card
          sx={{
            backgroundColor: "#1a1a1a",
            border: "1px solid rgba(20, 184, 166, 0.3)",
          }}
        >
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb sx={{ color: "#f59e0b" }} />
              <Typography
                variant="h6"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                Smart Tips
              </Typography>
            </div>

            <div className="space-y-3">
              {[
                {
                  tip: "Switch to annual subscriptions",
                  savings: "$127",
                  impact: "high",
                },
                {
                  tip: "Optimize grocery shopping days",
                  savings: "$45",
                  impact: "medium",
                },
                {
                  tip: "Consolidate streaming services",
                  savings: "$23",
                  impact: "low",
                },
              ].map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-[#0b0b0b] hover:bg-[#222] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Typography
                      variant="body2"
                      sx={{ color: "white", fontWeight: "500" }}
                    >
                      {suggestion.tip}
                    </Typography>
                    <Chip
                      label={`Save $${suggestion.savings}`}
                      size="small"
                      sx={{ backgroundColor: "#10b98120", color: "#10b981" }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        suggestion.impact === "high"
                          ? "bg-green-500"
                          : suggestion.impact === "medium"
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                      }`}
                    />
                    <Typography variant="caption" sx={{ color: "#aaa" }}>
                      {suggestion.impact} impact
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Category Analysis */}
      <Card
        sx={{
          backgroundColor: "#1a1a1a",
          border: "1px solid rgba(20, 184, 166, 0.3)",
        }}
      >
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <Typography
              variant="h6"
              sx={{ color: "white", fontWeight: "bold" }}
            >
              Category Deep Dive
            </Typography>
            <div className="flex gap-2">
              <Button
                size="small"
                variant="outlined"
                sx={{ borderColor: "#14b8a6", color: "#14b8a6" }}
              >
                Compare Periods
              </Button>
              <Button
                size="small"
                variant="outlined"
                sx={{ borderColor: "#14b8a6", color: "#14b8a6" }}
              >
                Set Alerts
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Performance Matrix */}
            <div>
              <Typography
                variant="subtitle1"
                sx={{ color: "white", mb: 3, fontWeight: "bold" }}
              >
                Performance Matrix
              </Typography>
              <div className="space-y-4">
                {dummyStats.expenseCategories
                  .slice(0, 5)
                  .map((category, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {category.icon}
                          <div>
                            <Typography
                              variant="body2"
                              sx={{ color: "white", fontWeight: "500" }}
                            >
                              {category.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#aaa" }}
                            >
                              Budget: ${category.budget} | Spent: $
                              {category.amount}
                            </Typography>
                          </div>
                        </div>
                        <div className="text-right">
                          <Typography
                            variant="body2"
                            sx={{
                              color:
                                category.amount > category.budget
                                  ? "#ef4444"
                                  : "#10b981",
                              fontWeight: "bold",
                            }}
                          >
                            {(
                              (category.amount / category.budget) *
                              100
                            ).toFixed(1)}
                            %
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#aaa" }}>
                            utilization
                          </Typography>
                        </div>
                      </div>

                      {/* Multi-layer progress bar */}
                      <div className="relative">
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(
                            (category.amount / category.budget) * 100,
                            100
                          )}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "#333",
                            "& .MuiLinearProgress-bar": {
                              backgroundColor:
                                category.amount > category.budget
                                  ? "#ef4444"
                                  : category.color,
                              borderRadius: 4,
                            },
                          }}
                        />
                        {/* Trend indicator */}
                        <div className="absolute -top-1 -right-1">
                          {Math.random() > 0.5 ? (
                            <TrendingUp
                              sx={{ color: "#10b981", fontSize: "0.8rem" }}
                            />
                          ) : (
                            <TrendingDown
                              sx={{ color: "#ef4444", fontSize: "0.8rem" }}
                            />
                          )}
                        </div>
                      </div>

                      {/* Micro insights */}
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">
                          Avg: ${(category.amount / 30).toFixed(2)}/day
                        </span>
                        <span className="text-gray-400">
                          Trend: {Math.random() > 0.5 ? "+" : "-"}
                          {(Math.random() * 20).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Category Insights */}
            <div>
              <Typography
                variant="subtitle1"
                sx={{ color: "white", mb: 3, fontWeight: "bold" }}
              >
                Category Insights
              </Typography>
              <div className="space-y-4">
                {[
                  {
                    category: "Food & Dining",
                    insight: "Peak spending on weekends",
                    recommendation:
                      "Try meal prep to reduce weekend dining costs",
                    impact: "$180/month savings potential",
                  },
                  {
                    category: "Transportation",
                    insight: "Uber usage increased 40% this month",
                    recommendation: "Consider monthly transit pass",
                    impact: "$65/month savings potential",
                  },
                  {
                    category: "Entertainment",
                    insight: "Multiple streaming subscriptions detected",
                    recommendation: "Consolidate or share subscriptions",
                    impact: "$35/month savings potential",
                  },
                ].map((insight, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-[#0b0b0b] border border-gray-700"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Psychology
                          sx={{ color: "#3b82f6", fontSize: "1rem" }}
                        />
                      </div>
                      <div className="flex-1">
                        <Typography
                          variant="body2"
                          sx={{ color: "white", fontWeight: "bold", mb: 1 }}
                        >
                          {insight.category}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#aaa", mb: 2 }}
                        >
                          {insight.insight}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#14b8a6", mb: 1 }}
                        >
                          💡 {insight.recommendation}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#f59e0b" }}>
                          {insight.impact}
                        </Typography>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Comparison Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Peer Comparison */}
        <Card
          sx={{
            backgroundColor: "#1a1a1a",
            border: "1px solid rgba(20, 184, 166, 0.3)",
          }}
        >
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <CompareArrows sx={{ color: "#8b5cf6" }} />
              <Typography
                variant="h6"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                Peer Comparison
              </Typography>
              <Chip
                label="Anonymous"
                size="small"
                sx={{ backgroundColor: "#8b5cf620", color: "#8b5cf6" }}
              />
            </div>

            <div className="space-y-4">
              {[
                { category: "Food", you: 35, peers: 28, better: false },
                { category: "Transport", you: 15, peers: 18, better: true },
                { category: "Entertainment", you: 12, peers: 15, better: true },
                { category: "Shopping", you: 20, peers: 16, better: false },
              ].map((comparison, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Typography variant="body2" sx={{ color: "white" }}>
                      {comparison.category}
                    </Typography>
                    <div className="flex items-center gap-2">
                      <Typography variant="caption" sx={{ color: "#aaa" }}>
                        You: {comparison.you}% | Peers: {comparison.peers}%
                      </Typography>
                      {comparison.better ? (
                        <CheckCircle
                          sx={{ color: "#10b981", fontSize: "1rem" }}
                        />
                      ) : (
                        <Warning sx={{ color: "#f59e0b", fontSize: "1rem" }} />
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <LinearProgress
                      variant="determinate"
                      value={comparison.you}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: "#333",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: comparison.better
                            ? "#10b981"
                            : "#f59e0b",
                        },
                      }}
                    />
                    {/* Peer average line */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white opacity-60"
                      style={{ left: `${comparison.peers}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Seasonal Analysis */}
        <Card
          sx={{
            backgroundColor: "#1a1a1a",
            border: "1px solid rgba(20, 184, 166, 0.3)",
          }}
        >
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <CalendarToday sx={{ color: "#14b8a6" }} />
              <Typography
                variant="h6"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                Seasonal Patterns
              </Typography>
            </div>

            <div className="space-y-4">
              {[
                {
                  season: "Winter",
                  spending: 4200,
                  trend: "up",
                  change: "+15%",
                },
                {
                  season: "Spring",
                  spending: 3800,
                  trend: "down",
                  change: "-8%",
                },
                {
                  season: "Summer",
                  spending: 4500,
                  trend: "up",
                  change: "+22%",
                },
                {
                  season: "Fall",
                  spending: 3900,
                  trend: "stable",
                  change: "+2%",
                },
              ].map((season, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#0b0b0b]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        season.trend === "up"
                          ? "bg-red-500"
                          : season.trend === "down"
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }`}
                    />
                    <Typography variant="body2" sx={{ color: "white" }}>
                      {season.season}
                    </Typography>
                  </div>
                  <div className="text-right">
                    <Typography
                      variant="body2"
                      sx={{ color: "white", fontWeight: "bold" }}
                    >
                      ${season.spending.toLocaleString()}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color:
                          season.trend === "up"
                            ? "#ef4444"
                            : season.trend === "down"
                            ? "#10b981"
                            : "#aaa",
                      }}
                    >
                      {season.change}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Financial Health Radar */}
      <Card
        sx={{
          backgroundColor: "#1a1a1a",
          border: "1px solid rgba(20, 184, 166, 0.3)",
        }}
      >
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Dashboard sx={{ color: "#14b8a6" }} />
              <Typography
                variant="h6"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                Financial Health Radar
              </Typography>
            </div>
            <Chip
              label="Real-time Analysis"
              sx={{ backgroundColor: "#10b98120", color: "#10b981" }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Radar Chart Simulation */}
            <div className="relative">
              <div className="w-64 h-64 mx-auto relative">
                {/* Radar background */}
                <div className="absolute inset-0 rounded-full border-2 border-gray-600 opacity-30" />
                <div className="absolute inset-4 rounded-full border border-gray-600 opacity-20" />
                <div className="absolute inset-8 rounded-full border border-gray-600 opacity-10" />

                {/* Radar points */}
                {[
                  { label: "Savings", value: 85, angle: 0 },
                  { label: "Budget", value: 72, angle: 60 },
                  { label: "Debt", value: 90, angle: 120 },
                  { label: "Income", value: 78, angle: 180 },
                  { label: "Expenses", value: 65, angle: 240 },
                  { label: "Goals", value: 88, angle: 300 },
                ].map((point, index) => {
                  const radius = (point.value / 100) * 120;
                  const x =
                    Math.cos(((point.angle - 90) * Math.PI) / 180) * radius;
                  const y =
                    Math.sin(((point.angle - 90) * Math.PI) / 180) * radius;

                  return (
                    <div key={index}>
                      {/* Point */}
                      <div
                        className="absolute w-3 h-3 bg-teal-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                          left: `calc(50% + ${x}px)`,
                          top: `calc(50% + ${y}px)`,
                        }}
                      />
                      {/* Label */}
                      <div
                        className="absolute text-xs text-white transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                          left: `calc(50% + ${x * 1.3}px)`,
                          top: `calc(50% + ${y * 1.3}px)`,
                        }}
                      >
                        {point.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Health Metrics */}
            <div className="space-y-4">
              {[
                {
                  metric: "Savings Rate",
                  score: 85,
                  status: "excellent",
                  description: "Well above recommended 20%",
                },
                {
                  metric: "Budget Adherence",
                  score: 72,
                  status: "good",
                  description: "Room for improvement in dining",
                },
                {
                  metric: "Debt Management",
                  score: 90,
                  status: "excellent",
                  description: "Low debt-to-income ratio",
                },
                {
                  metric: "Income Stability",
                  score: 78,
                  status: "good",
                  description: "Consistent monthly income",
                },
                {
                  metric: "Expense Control",
                  score: 65,
                  status: "fair",
                  description: "Variable spending patterns",
                },
                {
                  metric: "Goal Progress",
                  score: 88,
                  status: "excellent",
                  description: "On track for major goals",
                },
              ].map((metric, index) => (
                <div key={index} className="p-3 rounded-lg bg-[#0b0b0b]">
                  <div className="flex items-center justify-between mb-2">
                    <Typography
                      variant="body2"
                      sx={{ color: "white", fontWeight: "500" }}
                    >
                      {metric.metric}
                    </Typography>
                    <div className="flex items-center gap-2">
                      <Typography
                        variant="body2"
                        sx={{ color: "white", fontWeight: "bold" }}
                      >
                        {metric.score}
                      </Typography>
                      <Chip
                        label={metric.status}
                        size="small"
                        sx={{
                          backgroundColor:
                            metric.status === "excellent"
                              ? "#10b98120"
                              : metric.status === "good"
                              ? "#f59e0b20"
                              : "#ef444420",
                          color:
                            metric.status === "excellent"
                              ? "#10b981"
                              : metric.status === "good"
                              ? "#f59e0b"
                              : "#ef4444",
                          fontSize: "0.7rem",
                        }}
                      />
                    </div>
                  </div>
                  <LinearProgress
                    variant="determinate"
                    value={metric.score}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: "#333",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor:
                          metric.status === "excellent"
                            ? "#10b981"
                            : metric.status === "good"
                            ? "#f59e0b"
                            : "#ef4444",
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: "#aaa", mt: 1, display: "block" }}
                  >
                    {metric.description}
                  </Typography>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Notifications & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Real-time Alerts */}
        <Card
          sx={{
            backgroundColor: "#1a1a1a",
            border: "1px solid rgba(20, 184, 166, 0.3)",
          }}
        >
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <NotificationsActive sx={{ color: "#ef4444" }} />
              <Typography
                variant="h6"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                Live Alerts
              </Typography>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </div>

            <div className="space-y-3">
              {[
                {
                  type: "Budget Alert",
                  message: "Dining budget 90% used",
                  time: "2 min ago",
                  priority: "high",
                },
                {
                  type: "Unusual Activity",
                  message: "Large purchase detected: $450",
                  time: "1 hour ago",
                  priority: "medium",
                },
                {
                  type: "Goal Update",
                  message: "Vacation fund reached 75%",
                  time: "3 hours ago",
                  priority: "low",
                },
              ].map((alert, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-[#0b0b0b] border-l-4"
                  style={{
                    borderLeftColor:
                      alert.priority === "high"
                        ? "#ef4444"
                        : alert.priority === "medium"
                        ? "#f59e0b"
                        : "#10b981",
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Typography
                      variant="body2"
                      sx={{ color: "white", fontWeight: "500" }}
                    >
                      {alert.type}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#666" }}>
                      {alert.time}
                    </Typography>
                  </div>
                  <Typography variant="caption" sx={{ color: "#aaa" }}>
                    {alert.message}
                  </Typography>
                </div>
              ))}
            </div>

            <Button
              fullWidth
              size="small"
              sx={{ mt: 3, color: "#14b8a6" }}
              startIcon={<Notifications />}
            >
              Manage Alerts
            </Button>
          </CardContent>
        </Card>

        {/* Scheduled Reports */}
        <Card
          sx={{
            backgroundColor: "#1a1a1a",
            border: "1px solid rgba(20, 184, 166, 0.3)",
          }}
        >
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <AlarmOn sx={{ color: "#14b8a6" }} />
              <Typography
                variant="h6"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                Scheduled Reports
              </Typography>
            </div>

            <div className="space-y-3">
              {[
                {
                  name: "Weekly Summary",
                  schedule: "Every Monday 9 AM",
                  status: "active",
                },
                {
                  name: "Monthly Analysis",
                  schedule: "1st of every month",
                  status: "active",
                },
                {
                  name: "Quarterly Review",
                  schedule: "Every 3 months",
                  status: "paused",
                },
              ].map((report, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#0b0b0b]"
                >
                  <div>
                    <Typography
                      variant="body2"
                      sx={{ color: "white", fontWeight: "500" }}
                    >
                      {report.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#aaa" }}>
                      {report.schedule}
                    </Typography>
                  </div>
                  <Switch
                    checked={report.status === "active"}
                    size="small"
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#14b8a6",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          backgroundColor: "#14b8a6",
                        },
                    }}
                  />
                </div>
              ))}
            </div>

            <Button
              fullWidth
              size="small"
              sx={{ mt: 3, color: "#14b8a6" }}
              startIcon={<Report />}
            >
              Create Report
            </Button>
          </CardContent>
        </Card>

        {/* Data Sync Status */}
        <Card
          sx={{
            backgroundColor: "#1a1a1a",
            border: "1px solid rgba(20, 184, 166, 0.3)",
          }}
        >
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Sync sx={{ color: "#8b5cf6" }} />
              <Typography
                variant="h6"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                Data Sync
              </Typography>
            </div>

            <div className="space-y-4">
              {[
                {
                  source: "Bank Account",
                  status: "synced",
                  lastSync: "2 min ago",
                  transactions: 15,
                },
                {
                  source: "Credit Card",
                  status: "syncing",
                  lastSync: "syncing...",
                  transactions: 8,
                },
                {
                  source: "Investment Account",
                  status: "error",
                  lastSync: "2 hours ago",
                  transactions: 0,
                },
              ].map((sync, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#0b0b0b]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        sync.status === "synced"
                          ? "bg-green-500"
                          : sync.status === "syncing"
                          ? "bg-yellow-500 animate-pulse"
                          : "bg-red-500"
                      }`}
                    />
                    <div>
                      <Typography
                        variant="body2"
                        sx={{ color: "white", fontWeight: "500" }}
                      >
                        {sync.source}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#aaa" }}>
                        {sync.lastSync}
                      </Typography>
                    </div>
                  </div>
                  <Typography
                    variant="caption"
                    sx={{ color: "#14b8a6", fontWeight: "bold" }}
                  >
                    {sync.transactions} new
                  </Typography>
                </div>
              ))}
            </div>

            <Button
              fullWidth
              size="small"
              sx={{ mt: 3, color: "#14b8a6" }}
              startIcon={<CloudUpload />}
            >
              Sync All
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Controls */}
      <Card
        sx={{
          backgroundColor: "#1a1a1a",
          border: "1px solid rgba(20, 184, 166, 0.3)",
        }}
      >
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <Typography
              variant="h6"
              sx={{ color: "white", fontWeight: "bold" }}
            >
              Analytics Preferences
            </Typography>
            <Button
              size="small"
              variant="outlined"
              sx={{ borderColor: "#14b8a6", color: "#14b8a6" }}
              startIcon={<Security />}
            >
              Privacy Settings
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Data Visibility */}
            <div>
              <Typography
                variant="subtitle2"
                sx={{ color: "white", mb: 3, fontWeight: "bold" }}
              >
                Data Visibility
              </Typography>
              <div className="space-y-3">
                {[
                  { label: "Show Predictions", enabled: true },
                  { label: "Peer Comparisons", enabled: true },
                  { label: "Spending Alerts", enabled: false },
                  { label: "Goal Tracking", enabled: true },
                ].map((setting, index) => (
                  <FormControlLabel
                    key={index}
                    control={
                      <Switch
                        checked={setting.enabled}
                        size="small"
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "#14b8a6",
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                            {
                              backgroundColor: "#14b8a6",
                            },
                        }}
                      />
                    }
                    label={
                      <Typography variant="caption" sx={{ color: "#aaa" }}>
                        {setting.label}
                      </Typography>
                    }
                  />
                ))}
              </div>
            </div>

            {/* Notification Preferences */}
            <div>
              <Typography
                variant="subtitle2"
                sx={{ color: "white", mb: 3, fontWeight: "bold" }}
              >
                Notifications
              </Typography>
              <div className="space-y-3">
                {[
                  { label: "Budget Alerts", enabled: true },
                  { label: "Anomaly Detection", enabled: true },
                  { label: "Weekly Reports", enabled: false },
                  { label: "Goal Milestones", enabled: true },
                ].map((setting, index) => (
                  <FormControlLabel
                    key={index}
                    control={
                      <Switch
                        checked={setting.enabled}
                        size="small"
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "#14b8a6",
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                            {
                              backgroundColor: "#14b8a6",
                            },
                        }}
                      />
                    }
                    label={
                      <Typography variant="caption" sx={{ color: "#aaa" }}>
                        {setting.label}
                      </Typography>
                    }
                  />
                ))}
              </div>
            </div>

            {/* AI Features */}
            <div>
              <Typography
                variant="subtitle2"
                sx={{ color: "white", mb: 3, fontWeight: "bold" }}
              >
                AI Features
              </Typography>
              <div className="space-y-3">
                {[
                  { label: "Smart Categorization", enabled: true },
                  { label: "Spending Predictions", enabled: true },
                  { label: "Optimization Tips", enabled: false },
                  { label: "Fraud Detection", enabled: true },
                ].map((setting, index) => (
                  <FormControlLabel
                    key={index}
                    control={
                      <Switch
                        checked={setting.enabled}
                        size="small"
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "#14b8a6",
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                            {
                              backgroundColor: "#14b8a6",
                            },
                        }}
                      />
                    }
                    label={
                      <Typography variant="caption" sx={{ color: "#aaa" }}>
                        {setting.label}
                      </Typography>
                    }
                  />
                ))}
              </div>
            </div>

            {/* Export Options */}
            <div>
              <Typography
                variant="subtitle2"
                sx={{ color: "white", mb: 3, fontWeight: "bold" }}
              >
                Quick Actions
              </Typography>
              <div className="space-y-2">
                {[
                  { label: "Export CSV", icon: <Download /> },
                  { label: "Share Report", icon: <Timeline /> },
                  { label: "Print Summary", icon: <Visibility /> },
                  { label: "Archive Data", icon: <Remove /> },
                ].map((action, index) => (
                  <Button
                    key={index}
                    fullWidth
                    size="small"
                    variant="outlined"
                    startIcon={action.icon}
                    sx={{
                      borderColor: "#333",
                      color: "#aaa",
                      "&:hover": {
                        borderColor: "#14b8a6",
                        color: "#14b8a6",
                      },
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement & Gamification */}
      <Card
        sx={{
          backgroundColor: "#1a1a1a",
          border: "1px solid rgba(20, 184, 166, 0.3)",
        }}
      >
        <CardContent>
          <div className="flex items-center gap-2 mb-6">
            <EmojiEvents sx={{ color: "#f59e0b" }} />
            <Typography
              variant="h6"
              sx={{ color: "white", fontWeight: "bold" }}
            >
              Financial Achievements
            </Typography>
            <Chip
              label="Level 7"
              sx={{ backgroundColor: "#f59e0b20", color: "#f59e0b" }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Recent Achievements */}
            <div>
              <Typography
                variant="subtitle2"
                sx={{ color: "white", mb: 3, fontWeight: "bold" }}
              >
                Recent Achievements
              </Typography>
              <div className="space-y-3">
                {[
                  {
                    title: "Budget Master",
                    description: "Stayed under budget for 3 months",
                    earned: "2 days ago",
                    points: 500,
                  },
                  {
                    title: "Savings Streak",
                    description: "Saved money for 30 consecutive days",
                    earned: "1 week ago",
                    points: 300,
                  },
                  {
                    title: "Category King",
                    description: "Optimized all expense categories",
                    earned: "2 weeks ago",
                    points: 250,
                  },
                ].map((achievement, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-[#0b0b0b] border border-yellow-500/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <EmojiEvents
                          sx={{ color: "#f59e0b", fontSize: "1.2rem" }}
                        />
                      </div>
                      <div className="flex-1">
                        <Typography
                          variant="body2"
                          sx={{ color: "white", fontWeight: "bold" }}
                        >
                          {achievement.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "#aaa", display: "block" }}
                        >
                          {achievement.description}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#f59e0b" }}>
                          +{achievement.points} points • {achievement.earned}
                        </Typography>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Tracking */}
            <div>
              <Typography
                variant="subtitle2"
                sx={{ color: "white", mb: 3, fontWeight: "bold" }}
              >
                Progress Tracking
              </Typography>
              <div className="space-y-4">
                {[
                  {
                    goal: "Emergency Fund",
                    current: 7500,
                    target: 10000,
                    progress: 75,
                  },
                  {
                    goal: "Vacation Savings",
                    current: 2800,
                    target: 5000,
                    progress: 56,
                  },
                  {
                    goal: "Debt Reduction",
                    current: 3200,
                    target: 8000,
                    progress: 40,
                  },
                ].map((goal, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Typography
                        variant="body2"
                        sx={{ color: "white", fontWeight: "500" }}
                      >
                        {goal.goal}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#14b8a6", fontWeight: "bold" }}
                      >
                        ${goal.current.toLocaleString()} / $
                        {goal.target.toLocaleString()}
                      </Typography>
                    </div>
                    <LinearProgress
                      variant="determinate"
                      value={goal.progress}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: "#333",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "#14b8a6",
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: "#aaa", display: "block" }}
                    >
                      {goal.progress}% complete
                    </Typography>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <div>
              <Typography
                variant="subtitle2"
                sx={{ color: "white", mb: 3, fontWeight: "bold" }}
              >
                Community Leaderboard
              </Typography>
              <div className="space-y-3">
                {[
                  { rank: 1, name: "You", score: 2450, badge: "🥇" },
                  { rank: 2, name: "Alex M.", score: 2380, badge: "🥈" },
                  { rank: 3, name: "Sarah K.", score: 2290, badge: "🥉" },
                  { rank: 4, name: "Mike R.", score: 2150, badge: "" },
                  { rank: 5, name: "Emma L.", score: 2050, badge: "" },
                ].map((user, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      user.rank === 1 ? "bg-yellow-500/10" : "bg-[#0b0b0b]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Typography
                        variant="body2"
                        sx={{
                          color: user.rank === 1 ? "#f59e0b" : "white",
                          fontWeight: user.rank === 1 ? "bold" : "normal",
                        }}
                      >
                        #{user.rank}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: user.rank === 1 ? "#f59e0b" : "white",
                          fontWeight: user.rank === 1 ? "bold" : "normal",
                        }}
                      >
                        {user.name} {user.badge}
                      </Typography>
                    </div>
                    <Typography
                      variant="caption"
                      sx={{ color: "#14b8a6", fontWeight: "bold" }}
                    >
                      {user.score.toLocaleString()} pts
                    </Typography>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
