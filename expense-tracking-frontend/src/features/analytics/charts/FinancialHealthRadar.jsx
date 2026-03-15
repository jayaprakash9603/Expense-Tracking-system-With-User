import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
} from "@mui/material";
import { Dashboard } from "@mui/icons-material";

const FinancialHealthRadar = ({ healthMetrics }) => {
  const defaultMetrics = [
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
  ];

  const metrics = healthMetrics || defaultMetrics;
  const overallScore = Math.round(
    metrics.reduce((sum, metric) => sum + metric.score, 0) / metrics.length
  );

  // Radar chart simulation with CSS
  const RadarPoint = ({ metric, index, total }) => {
    const angle = (index * 360) / total - 90;
    const radius = (metric.score / 100) * 120;
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;

    return (
      <>
        {/* Point */}
        <div
          className="absolute w-3 h-3 bg-teal-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
          style={{
            left: `calc(50% + ${x}px)`,
            top: `calc(50% + ${y}px)`,
            animationDelay: `${index * 200}ms`,
          }}
        />
        {/* Label */}
        <div
          className="absolute text-xs text-white transform -translate-x-1/2 -translate-y-1/2 font-medium"
          style={{
            left: `calc(50% + ${x * 1.4}px)`,
            top: `calc(50% + ${y * 1.4}px)`,
          }}
        >
          {metric.metric.split(" ")[0]}
        </div>
      </>
    );
  };

  return (
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
              Financial Health Score
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            <Typography
              variant="h4"
              sx={{ color: "#14b8a6", fontWeight: "bold" }}
            >
              {overallScore}
            </Typography>
            <Chip
              label={
                overallScore >= 80
                  ? "Excellent"
                  : overallScore >= 60
                  ? "Good"
                  : "Needs Improvement"
              }
              sx={{
                backgroundColor:
                  overallScore >= 80
                    ? "#10b98120"
                    : overallScore >= 60
                    ? "#f59e0b20"
                    : "#ef444420",
                color:
                  overallScore >= 80
                    ? "#10b981"
                    : overallScore >= 60
                    ? "#f59e0b"
                    : "#ef4444",
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Radar Chart */}
          <div className="relative">
            <div className="w-64 h-64 mx-auto relative">
              {/* Radar background circles */}
              <div className="absolute inset-0 rounded-full border-2 border-gray-600 opacity-30" />
              <div className="absolute inset-4 rounded-full border border-gray-600 opacity-20" />
              <div className="absolute inset-8 rounded-full border border-gray-600 opacity-10" />

              {/* Center point */}
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-teal-500 rounded-full transform -translate-x-1/2 -translate-y-1/2" />

              {/* Radar points */}
              {metrics.map((metric, index) => (
                <RadarPoint
                  key={index}
                  metric={metric}
                  index={index}
                  total={metrics.length}
                />
              ))}
            </div>
          </div>

          {/* Health Metrics */}
          <div className="space-y-4">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-[#0b0b0b] transition-all duration-500 hover:bg-[#1a1a1a]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
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
                      transition: "transform 2s ease-in-out",
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
  );
};

export default FinancialHealthRadar;
