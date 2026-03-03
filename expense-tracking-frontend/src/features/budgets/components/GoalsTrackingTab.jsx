import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
} from "@mui/material";
import { Add, Lightbulb, Warning, CheckCircle } from "@mui/icons-material";

const GoalsTrackingTab = ({ dummyStats, setOpenGoalDialog }) => (
  <div className="space-y-6">
    {/* Goals Overview */}
    <div className="flex items-center justify-between">
      <Typography variant="h5" sx={{ color: "white", fontWeight: "bold" }}>
        Financial Goals
      </Typography>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => setOpenGoalDialog(true)}
        sx={{
          backgroundColor: "#14b8a6",
          color: "#0b0b0b",
          "&:hover": { backgroundColor: "#0d9488" },
        }}
      >
        Add Goal
      </Button>
    </div>

    {/* Active Goals */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {dummyStats.financialGoals.map((goal) => (
        <Card
          key={goal.id}
          sx={{
            backgroundColor: "#1a1a1a",
            border: "1px solid rgba(20, 184, 166, 0.3)",
          }}
        >
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <Typography variant="h6" sx={{ color: "white" }}>
                {goal.title}
              </Typography>
              <Chip
                label={goal.priority}
                size="small"
                sx={{
                  backgroundColor:
                    goal.priority === "high"
                      ? "#ef4444"
                      : goal.priority === "medium"
                      ? "#f59e0b"
                      : "#10b981",
                  color: "white",
                }}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Typography variant="body2" sx={{ color: "#aaa" }}>
                  Progress
                </Typography>
                <Typography variant="body2" sx={{ color: "white" }}>
                  ${goal.current.toLocaleString()} / $
                  {goal.target.toLocaleString()}
                </Typography>
              </div>

              <LinearProgress
                variant="determinate"
                value={(goal.current / goal.target) * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#333",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "#14b8a6",
                  },
                }}
              />

              <div className="flex justify-between items-center">
                <Typography variant="caption" sx={{ color: "#aaa" }}>
                  Deadline: {new Date(goal.deadline).toLocaleDateString()}
                </Typography>
                <Typography variant="caption" sx={{ color: "#14b8a6" }}>
                  {Math.round((goal.current / goal.target) * 100)}% Complete
                </Typography>
              </div>

              <div className="flex gap-2 mt-3">
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: "#14b8a6", color: "#14b8a6" }}
                >
                  Update
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: "#ef4444", color: "#ef4444" }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Goal Insights */}
    <Card
      sx={{
        backgroundColor: "#1a1a1a",
        border: "1px solid rgba(20, 184, 166, 0.3)",
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
          Goal Insights
        </Typography>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0b0b0b]">
            <Lightbulb sx={{ color: "#f59e0b" }} />
            <div>
              <Typography variant="body2" sx={{ color: "white" }}>
                You're ahead of schedule on your Emergency Fund goal!
              </Typography>
              <Typography variant="caption" sx={{ color: "#aaa" }}>
                At your current savings rate, you'll reach your goal 2 months
                early.
              </Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0b0b0b]">
            <Warning sx={{ color: "#ef4444" }} />
            <div>
              <Typography variant="body2" sx={{ color: "white" }}>
                Credit Card debt goal needs attention
              </Typography>
              <Typography variant="caption" sx={{ color: "#aaa" }}>
                Consider increasing monthly payments to meet your deadline.
              </Typography>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0b0b0b]">
            <CheckCircle sx={{ color: "#10b981" }} />
            <div>
              <Typography variant="body2" sx={{ color: "white" }}>
                Vacation fund is on track
              </Typography>
              <Typography variant="caption" sx={{ color: "#aaa" }}>
                You're saving $287/month, right on schedule for your August
                trip.
              </Typography>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default GoalsTrackingTab;
