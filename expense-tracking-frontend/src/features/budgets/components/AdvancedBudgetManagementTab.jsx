import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  LinearProgress,
} from "@mui/material";
import { Settings, PieChart } from "@mui/icons-material";

const AdvancedBudgetManagementTab = ({
  formData,
  dummyStats,
  setOpenBudgetDialog,
  setOpenCategoryDialog,
}) => (
  <div className="space-y-6">
    {/* Budget Templates */}
    <Card
      sx={{
        backgroundColor: "#1a1a1a",
        border: "1px solid rgba(20, 184, 166, 0.3)",
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
          Budget Templates
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "50/30/20 Rule", needs: 50, wants: 30, savings: 20 },
            { name: "Conservative", needs: 60, wants: 20, savings: 20 },
            { name: "Aggressive Saver", needs: 40, wants: 20, savings: 40 },
          ].map((template, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-[#0b0b0b] border border-gray-700 hover:border-teal-500 cursor-pointer transition-all"
            >
              <Typography
                variant="body1"
                sx={{ color: "white", fontWeight: "bold", mb: 2 }}
              >
                {template.name}
              </Typography>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Needs</span>
                  <span className="text-sm text-white">{template.needs}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Wants</span>
                  <span className="text-sm text-white">{template.wants}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Savings</span>
                  <span className="text-sm text-white">
                    {template.savings}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Recurring Expenses Management */}
    <Card
      sx={{
        backgroundColor: "#1a1a1a",
        border: "1px solid rgba(20, 184, 166, 0.3)",
      }}
    >
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <Typography variant="h6" sx={{ color: "white" }}>
            Recurring Expenses
          </Typography>
          <Button
            variant="outlined"
            size="small"
            sx={{ borderColor: "#14b8a6", color: "#14b8a6" }}
          >
            Manage Subscriptions
          </Button>
        </div>
        <div className="space-y-3">
          {[
            {
              name: "Netflix",
              amount: 15.99,
              frequency: "Monthly",
              nextDue: "2024-02-15",
            },
            {
              name: "Spotify",
              amount: 9.99,
              frequency: "Monthly",
              nextDue: "2024-02-10",
            },
            {
              name: "Gym Membership",
              amount: 49.99,
              frequency: "Monthly",
              nextDue: "2024-02-20",
            },
          ].map((expense, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-[#0b0b0b]"
            >
              <div>
                <Typography
                  variant="body2"
                  sx={{ color: "white", fontWeight: "500" }}
                >
                  {expense.name}
                </Typography>
                <Typography variant="caption" sx={{ color: "#aaa" }}>
                  Next due: {expense.nextDue}
                </Typography>
              </div>
              <div className="text-right">
                <Typography
                  variant="body2"
                  sx={{ color: "#ef4444", fontWeight: "bold" }}
                >
                  ${expense.amount}
                </Typography>
                <Typography variant="caption" sx={{ color: "#aaa" }}>
                  {expense.frequency}
                </Typography>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default AdvancedBudgetManagementTab;
