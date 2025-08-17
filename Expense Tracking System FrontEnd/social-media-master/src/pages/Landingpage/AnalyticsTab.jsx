import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

const AnalyticsTab = ({ dummyStats }) => (
  <div className="space-y-6">
    <Card
      sx={{
        backgroundColor: "#1a1a1a",
        border: "1px solid rgba(20, 184, 166, 0.3)",
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
          Financial Insights
        </Typography>
        <div className="space-y-3">
          {dummyStats.insights.map((insight, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg bg-[#0b0b0b] border-l-4 ${
                insight.impact === "positive"
                  ? "border-green-500"
                  : insight.impact === "warning"
                  ? "border-yellow-500"
                  : "border-blue-500"
              }`}
            >
              <Typography variant="body2" sx={{ color: "white" }}>
                {insight.message}
              </Typography>
              <Typography variant="caption" sx={{ color: "#aaa" }}>
                Impact: {insight.impact}
              </Typography>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    <Card
      sx={{
        backgroundColor: "#1a1a1a",
        border: "1px solid rgba(20, 184, 166, 0.3)",
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
          Monthly Trends
        </Typography>
        <div className="space-y-2">
          {dummyStats.monthlyTrends.map((trend, index) => (
            <div key={index} className="flex justify-between">
              <Typography variant="body2" sx={{ color: "#aaa" }}>
                {trend.month}
              </Typography>
              <Typography variant="body2" sx={{ color: "#10b981" }}>
                Income: ${trend.income}
              </Typography>
              <Typography variant="body2" sx={{ color: "#ef4444" }}>
                Expenses: ${trend.expenses}
              </Typography>
              <Typography variant="body2" sx={{ color: "#14b8a6" }}>
                Savings: ${trend.savings}
              </Typography>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default AnalyticsTab;
