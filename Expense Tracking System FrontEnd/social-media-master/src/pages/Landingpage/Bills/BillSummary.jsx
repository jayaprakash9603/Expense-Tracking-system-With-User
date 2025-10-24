import React from "react";
import { Typography, Box, Grid, Card } from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";

const BillSummary = ({ billStats, selectedDate }) => {
  const { colors } = useTheme();

  // Utility functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatMonth = (date) => {
    return date.format("MMMM YYYY");
  };

  // Constants
  const COLORS = {
    primary: colors.primary_accent,
    error: "#f44336",
    background: colors.primary_bg,
    surface: colors.tertiary_bg,
    textSecondary: colors.secondary_text,
  };

  const HOVER_OPACITY = 0.2;

  // Computed values
  const netAmount = billStats.totalIncome - billStats.totalExpense;
  const isNetPositive = netAmount >= 0;

  // Card configuration factory
  const createCardConfig = (
    id,
    icon,
    label,
    value,
    isPositive = true,
    formatValue = true
  ) => ({
    id,
    icon,
    label,
    value,
    color: isPositive ? COLORS.primary : COLORS.error,
    borderColor: isPositive ? COLORS.primary : COLORS.error,
    hoverColor: `rgba(${
      isPositive ? "20, 184, 166" : "244, 67, 54"
    }, ${HOVER_OPACITY})`,
    formatValue,
  });

  // Card configurations using factory
  const cardConfigs = [
    createCardConfig(
      "total",
      ReceiptIcon,
      "Total Bills",
      billStats.total,
      true,
      false
    ),
    createCardConfig(
      "income",
      TrendingUpIcon,
      "Total Income",
      billStats.totalIncome
    ),
    createCardConfig(
      "expense",
      TrendingDownIcon,
      "Total Expenses",
      billStats.totalExpense,
      false
    ),
    createCardConfig(
      "net",
      MoneyIcon,
      "Net Balance",
      Math.abs(netAmount),
      isNetPositive
    ),
  ];

  // Reusable card component
  const SummaryCard = ({ config }) => {
    const {
      icon: IconComponent,
      label,
      value,
      color,
      borderColor,
      hoverColor,
      formatValue,
    } = config;

    return (
      <Card
        sx={{
          background: COLORS.background,
          border: `1px solid ${borderColor}`,
          borderRadius: "8px",
          textAlign: "center",
          p: 1.5,
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: `0 4px 12px ${hoverColor}`,
            backgroundColor: COLORS.surface,
          },
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 8px",
          }}
        >
          <IconComponent sx={{ color: COLORS.surface, fontSize: 20 }} />
        </Box>

        <Typography
          variant="caption"
          sx={{
            color: COLORS.textSecondary,
            fontWeight: 600,
            display: "block",
            mb: 0.5,
          }}
        >
          {label}
        </Typography>

        <Typography
          variant="h5"
          sx={{
            color: color,
            fontWeight: 700,
          }}
        >
          {formatValue ? formatCurrency(value) : value}
        </Typography>
      </Card>
    );
  };

  return (
    <Box
      sx={{
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.background}`,
        mt: 2,
      }}
    >
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {cardConfigs.map((config) => (
            <Grid item xs={6} sm={3} key={config.id}>
              <SummaryCard config={config} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default BillSummary;
