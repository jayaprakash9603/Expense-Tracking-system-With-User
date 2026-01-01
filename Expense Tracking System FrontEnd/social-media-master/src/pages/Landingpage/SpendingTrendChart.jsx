import React from "react";
import { Card, CardContent, Typography, Chip } from "@mui/material";
import { TrendingUp, TrendingDown } from "@mui/icons-material";
import LineChart from "./LineChart";
import { useTranslation } from "../../hooks/useTranslation";

const SpendingTrendChart = ({ data, timeframe = "monthly" }) => {
  const { t } = useTranslation();
  const defaultLabels = ["jan", "feb", "mar", "apr", "may", "jun"].map(
    (monthKey) => t(`cashflow.monthsShort.${monthKey}`)
  );
  const incomeLabel =
    data?.incomeLabel || t("dashboard.charts.datasetLabels.income");
  const expensesLabel =
    data?.expensesLabel || t("dashboard.charts.datasetLabels.expenses");
  const savingsLabel =
    data?.savingsLabel || t("dashboard.charts.datasetLabels.savings");
  const timeframeChipLabels = {
    weekly: t("dashboard.charts.timeframeChips.weekly"),
    monthly: t("dashboard.charts.timeframeChips.monthly"),
    quarterly: t("dashboard.charts.timeframeChips.quarterly"),
    yearly: t("dashboard.charts.timeframeChips.yearly"),
  };
  const timeframeLabel = timeframeChipLabels[timeframe] || timeframe;

  // Generate sample data based on your backend structure
  const chartData = {
    labels: data?.labels || defaultLabels,
    datasets: [
      {
        label: incomeLabel,
        data: data?.income || [3200, 3400, 3100, 3600, 3300, 3500],
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: expensesLabel,
        data: data?.expenses || [2800, 2900, 2700, 3100, 2850, 2950],
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#ef4444",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: savingsLabel,
        data: data?.savings || [400, 500, 400, 500, 450, 550],
        borderColor: "#14b8a6",
        backgroundColor: "rgba(20, 184, 166, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#14b8a6",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
    animation: {
      duration: 2000,
      easing: "easeInOutQuart",
    },
  };

  return (
    <Card
      sx={{
        backgroundColor: "#1a1a1a",
        border: "1px solid rgba(20, 184, 166, 0.3)",
        height: "100%",
      }}
    >
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
            {t("dashboard.charts.titles.spendingTrends")}
          </Typography>
          <div className="flex gap-2">
            <Chip
              label={timeframeLabel}
              size="small"
              sx={{ backgroundColor: "#14b8a620", color: "#14b8a6" }}
            />
            <Chip
              icon={<TrendingUp />}
              label="+12.5%"
              size="small"
              sx={{ backgroundColor: "#10b98120", color: "#10b981" }}
            />
          </div>
        </div>
        <LineChart data={chartData} options={options} height={350} />
      </CardContent>
    </Card>
  );
};

export default SpendingTrendChart;
