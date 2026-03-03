/**
 * ActivityStats Component
 * Compact summary statistics for friend activities.
 * Displays service breakdown with progress bars in a single row.
 */

import React, { useMemo } from "react";
import { Box, Typography, LinearProgress, Tooltip } from "@mui/material";
import {
  Receipt as ExpenseIcon,
  Description as BillIcon,
  AccountBalanceWallet as BudgetIcon,
  Category as CategoryIcon,
  Payment as PaymentIcon,
} from "@mui/icons-material";
import { useTheme } from "../../../../hooks/useTheme";
import { calculateActivityStats, getEntityColor } from "../utils";
import { SERVICE_LABELS } from "../constants";

const serviceIcons = {
  EXPENSE: ExpenseIcon,
  BILL: BillIcon,
  BUDGET: BudgetIcon,
  CATEGORY: CategoryIcon,
  PAYMENT: PaymentIcon,
};

const ActivityStats = ({ activities = [] }) => {
  const { colors } = useTheme();

  const stats = useMemo(() => calculateActivityStats(activities), [activities]);

  // All available services for consistent display
  const ALL_SERVICES = ["BILL", "EXPENSE", "BUDGET", "PAYMENT", "CATEGORY"];

  // Calculate percentages for service breakdown - always show all services
  const serviceBreakdown = useMemo(() => {
    return ALL_SERVICES.map((service) => {
      const count = stats.byService[service] || 0;
      const percentage =
        stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : "0.0";
      return {
        service,
        count,
        percentage,
        color: getEntityColor(service),
        label: SERVICE_LABELS[service] || service,
        Icon: serviceIcons[service] || ExpenseIcon,
      };
    }).sort((a, b) => b.count - a.count);
  }, [stats]);

  return (
    <Box
      sx={{
        p: 1.5,
        backgroundColor: colors.primary_bg,
        borderRadius: "10px",
        border: `1px solid ${colors.border_color}`,
        width: "100%",
      }}
    >
      {/* Header Row - Title and Total Amount */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            color: colors.primary_text,
            fontSize: "0.95rem",
          }}
        >
          Activity Summary
        </Typography>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: colors.primary_text,
            fontSize: "1.1rem",
          }}
        >
          $
          {stats.totalAmount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Typography>
      </Box>

      {/* Service Breakdown - Horizontal Layout, Full Width */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "nowrap",
          alignItems: "center",
          justifyContent: "flex-start",
          overflowX: "auto",
        }}
      >
        {serviceBreakdown.map(
          ({ service, count, percentage, color, label, Icon }) => (
            <Tooltip
              key={service}
              title={`${label}: ${count} activities (${percentage}%)`}
              arrow
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  minWidth: "160px",
                  flex: "1 1 auto",
                }}
              >
                {/* Icon and Label */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    minWidth: "fit-content",
                  }}
                >
                  <Icon sx={{ fontSize: 16, color }} />
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.secondary_text,
                      fontSize: "0.75rem",
                      fontWeight: 500,
                    }}
                  >
                    {label}
                  </Typography>
                </Box>

                {/* Count and Progress */}
                <Box sx={{ flex: 1, minWidth: "60px" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: 0.5,
                      mb: 0.25,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: colors.primary_text,
                        fontSize: "0.8rem",
                      }}
                    >
                      {count}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color,
                        fontSize: "0.7rem",
                      }}
                    >
                      ({percentage}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={parseFloat(percentage)}
                    sx={{
                      height: 6,
                      borderRadius: "3px",
                      backgroundColor: `${color}30`,
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: color,
                        borderRadius: "3px",
                      },
                    }}
                  />
                </Box>
              </Box>
            </Tooltip>
          ),
        )}
      </Box>
    </Box>
  );
};

export default React.memo(ActivityStats);
