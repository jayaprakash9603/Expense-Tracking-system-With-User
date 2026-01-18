/**
 * ActivityStats Component
 * Displays summary statistics for friend activities.
 */

import React, { useMemo } from "react";
import { Box, Typography, Chip, LinearProgress, Tooltip } from "@mui/material";
import {
  Receipt as ExpenseIcon,
  Description as BillIcon,
  AccountBalanceWallet as BudgetIcon,
  Category as CategoryIcon,
  Payment as PaymentIcon,
  TrendingUp as TrendingIcon,
  Notifications as NotificationIcon,
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

const ActivityStats = ({ activities = [], compact = false }) => {
  const { colors } = useTheme();

  const stats = useMemo(() => calculateActivityStats(activities), [activities]);

  // Calculate percentages for service breakdown
  const serviceBreakdown = useMemo(() => {
    if (stats.total === 0) return [];

    return Object.entries(stats.byService)
      .map(([service, count]) => ({
        service,
        count,
        percentage: ((count / stats.total) * 100).toFixed(1),
        color: getEntityColor(service),
        label: SERVICE_LABELS[service] || service,
        Icon: serviceIcons[service] || ExpenseIcon,
      }))
      .sort((a, b) => b.count - a.count);
  }, [stats]);

  if (compact) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 1.5,
          backgroundColor: colors.secondary_bg,
          borderRadius: "8px",
          border: `1px solid ${colors.border_color}`,
        }}
      >
        <Chip
          icon={<NotificationIcon />}
          label={`${stats.total} activities`}
          size="small"
          sx={{
            backgroundColor: `${colors.primary_accent}20`,
            color: colors.primary_accent,
          }}
        />
        {stats.unread > 0 && (
          <Chip
            label={`${stats.unread} unread`}
            size="small"
            sx={{
              backgroundColor: "#ef444420",
              color: "#ef4444",
            }}
          />
        )}
        {stats.totalAmount > 0 && (
          <Chip
            icon={<TrendingIcon />}
            label={`$${stats.totalAmount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            size="small"
            sx={{
              backgroundColor: "#22c55e20",
              color: "#22c55e",
            }}
          />
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: colors.secondary_bg,
        borderRadius: "8px",
        border: `1px solid ${colors.border_color}`,
      }}
    >
      {/* Header Stats */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: colors.primary_text }}
          >
            Activity Summary
          </Typography>
          <Typography variant="caption" sx={{ color: colors.tertiary_text }}>
            Overview of your friends' recent activities
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Total activities">
            <Chip
              icon={<NotificationIcon />}
              label={stats.total}
              sx={{
                backgroundColor: `${colors.primary_accent}20`,
                color: colors.primary_accent,
                fontWeight: 600,
              }}
            />
          </Tooltip>
          {stats.unread > 0 && (
            <Tooltip title="Unread activities">
              <Chip
                label={`${stats.unread} unread`}
                sx={{
                  backgroundColor: "#ef444420",
                  color: "#ef4444",
                  fontWeight: 600,
                }}
              />
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Service Breakdown */}
      {serviceBreakdown.length > 0 && (
        <Box>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: colors.secondary_text,
              mb: 1.5,
            }}
          >
            By Service Type
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {serviceBreakdown.map(
              ({ service, count, percentage, color, label, Icon }) => (
                <Box key={service}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Icon sx={{ fontSize: 18, color }} />
                      <Typography
                        variant="body2"
                        sx={{ color: colors.primary_text }}
                      >
                        {label}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ color: colors.tertiary_text }}
                    >
                      {count} ({percentage}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={parseFloat(percentage)}
                    sx={{
                      height: 6,
                      borderRadius: "3px",
                      backgroundColor: `${color}20`,
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: color,
                        borderRadius: "3px",
                      },
                    }}
                  />
                </Box>
              ),
            )}
          </Box>
        </Box>
      )}

      {/* Action Breakdown */}
      {Object.keys(stats.byAction).length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: colors.secondary_text,
              mb: 1,
            }}
          >
            By Action
          </Typography>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {Object.entries(stats.byAction).map(([action, count]) => {
              const actionColors = {
                CREATE: "#22c55e",
                UPDATE: "#3b82f6",
                DELETE: "#ef4444",
              };
              const color = actionColors[action] || colors.tertiary_text;

              return (
                <Chip
                  key={action}
                  size="small"
                  label={`${action}: ${count}`}
                  sx={{
                    backgroundColor: `${color}20`,
                    color: color,
                    fontWeight: 500,
                    fontSize: "0.75rem",
                  }}
                />
              );
            })}
          </Box>
        </Box>
      )}

      {/* Total Amount */}
      {stats.totalAmount > 0 && (
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            backgroundColor: colors.primary_bg,
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TrendingIcon sx={{ fontSize: 20, color: "#22c55e" }} />
            <Typography variant="body2" sx={{ color: colors.secondary_text }}>
              Total Activity Amount
            </Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: colors.primary_text }}
          >
            $
            {stats.totalAmount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(ActivityStats);
