import React from "react";
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
} from "@mui/material";
import { TrendingUp, TrendingDown } from "@mui/icons-material";
import DonutChart from "./DonutChart";

const CategoryBreakDown = ({ categories }) => {
  const chartData = {
    labels: categories?.map((cat) => cat.name) || [
      "Food",
      "Transport",
      "Entertainment",
      "Shopping",
      "Bills",
    ],
    datasets: [
      {
        data: categories?.map((cat) => cat.amount) || [
          1200, 800, 600, 900, 1100,
        ],
        backgroundColor: [
          "#ef4444",
          "#f59e0b",
          "#10b981",
          "#3b82f6",
          "#8b5cf6",
        ],
        borderColor: ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"],
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverOffset: 10,
      },
    ],
  };

  const defaultCategories = [
    {
      name: "Food & Dining",
      amount: 1200,
      budget: 1000,
      color: "#ef4444",
      trend: "up",
    },
    {
      name: "Transportation",
      amount: 800,
      budget: 900,
      color: "#f59e0b",
      trend: "down",
    },
    {
      name: "Entertainment",
      amount: 600,
      budget: 700,
      color: "#10b981",
      trend: "up",
    },
    {
      name: "Shopping",
      amount: 900,
      budget: 800,
      color: "#3b82f6",
      trend: "up",
    },
    {
      name: "Bills & Utilities",
      amount: 1100,
      budget: 1200,
      color: "#8b5cf6",
      trend: "down",
    },
  ];

  const categoryData = categories || defaultCategories;

  return (
    <Card
      sx={{
        backgroundColor: "#1a1a1a",
        border: "1px solid rgba(20, 184, 166, 0.3)",
        height: "100%",
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          sx={{ color: "white", fontWeight: "bold", mb: 4 }}
        >
          Category Breakdown
        </Typography>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donut Chart */}
          <div>
            <DonutChart data={chartData} height={300} />
          </div>

          {/* Category Details */}
          <div className="space-y-4">
            {categoryData.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ color: "white", fontWeight: "500" }}
                    >
                      {category.name}
                    </Typography>
                  </div>
                  <div className="flex items-center gap-2">
                    <Typography variant="caption" sx={{ color: "#aaa" }}>
                      ${category.amount}
                    </Typography>
                    {category.trend === "up" ? (
                      <TrendingUp sx={{ color: "#ef4444", fontSize: "1rem" }} />
                    ) : (
                      <TrendingDown
                        sx={{ color: "#10b981", fontSize: "1rem" }}
                      />
                    )}
                  </div>
                </div>

                <LinearProgress
                  variant="determinate"
                  value={Math.min(
                    (category.amount / category.budget) * 100,
                    100
                  )}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#333",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor:
                        category.amount > category.budget
                          ? "#ef4444"
                          : category.color,
                      borderRadius: 3,
                      transition: "transform 1.5s ease-in-out",
                    },
                  }}
                />

                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">
                    Budget: ${category.budget}
                  </span>
                  <span
                    className={`${
                      category.amount > category.budget
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    {((category.amount / category.budget) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryBreakDown;
