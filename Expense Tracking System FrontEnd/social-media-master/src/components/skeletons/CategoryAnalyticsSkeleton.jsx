import React from "react";
import { Box, Grid, Skeleton } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";
import PageHeader from "../PageHeader";

/**
 * Skeleton loader for CategoryAnalyticsView
 * Displays placeholders while analytics data is loading
 */
const CategoryAnalyticsSkeleton = ({ onClose, containerStyle }) => {
  const { colors } = useTheme();

  const cardStyle = {
    backgroundColor: colors.primary_bg,
    borderRadius: "12px",
    border: `1px solid ${colors.border_color}`,
    padding: "16px",
  };

  return (
    <div className="flex flex-col relative" style={containerStyle}>
      {/* Header Skeleton */}
      <PageHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Skeleton
              variant="rounded"
              width={48}
              height={48}
              sx={{ bgcolor: colors.border_color }}
            />
            <Box>
              <Skeleton
                variant="text"
                width={200}
                height={28}
                sx={{ bgcolor: colors.border_color }}
              />
              <Skeleton
                variant="text"
                width={150}
                height={18}
                sx={{ bgcolor: colors.border_color }}
              />
            </Box>
          </Box>
        }
        onClose={onClose}
        rightContent={
          <Box sx={{ display: "flex", gap: 1 }}>
            <Skeleton
              variant="rounded"
              width={140}
              height={36}
              sx={{ bgcolor: colors.border_color }}
            />
            <Skeleton
              variant="rounded"
              width={100}
              height={36}
              sx={{ bgcolor: colors.border_color }}
            />
            <Skeleton
              variant="circular"
              width={36}
              height={36}
              sx={{ bgcolor: colors.border_color }}
            />
          </Box>
        }
      />

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          paddingRight: 1,
        }}
      >
        {/* KPI Cards Row */}
        <Grid container spacing={2} sx={{ marginBottom: 3 }}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Box sx={cardStyle}>
                <Skeleton
                  variant="text"
                  width="60%"
                  height={20}
                  sx={{ bgcolor: colors.border_color, mb: 1 }}
                />
                <Skeleton
                  variant="text"
                  width="80%"
                  height={40}
                  sx={{ bgcolor: colors.border_color, mb: 1 }}
                />
                <Skeleton
                  variant="text"
                  width="40%"
                  height={16}
                  sx={{ bgcolor: colors.border_color }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Charts Row */}
        <Grid container spacing={2} sx={{ marginBottom: 3 }}>
          {/* Monthly Trend Chart Skeleton */}
          <Grid item xs={12} md={8}>
            <Box sx={{ ...cardStyle, height: 320 }}>
              <Skeleton
                variant="text"
                width={200}
                height={24}
                sx={{ bgcolor: colors.border_color, mb: 2 }}
              />
              <Skeleton
                variant="rectangular"
                width="100%"
                height={240}
                sx={{ bgcolor: colors.border_color, borderRadius: "8px" }}
              />
            </Box>
          </Grid>

          {/* Payment Distribution Chart Skeleton */}
          <Grid item xs={12} md={4}>
            <Box sx={{ ...cardStyle, height: 320 }}>
              <Skeleton
                variant="text"
                width={150}
                height={24}
                sx={{ bgcolor: colors.border_color, mb: 2 }}
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 200,
                }}
              >
                <Skeleton
                  variant="circular"
                  width={160}
                  height={160}
                  sx={{ bgcolor: colors.border_color }}
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                {[1, 2, 3].map((item) => (
                  <Box
                    key={item}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Skeleton
                      variant="circular"
                      width={12}
                      height={12}
                      sx={{ bgcolor: colors.border_color }}
                    />
                    <Skeleton
                      variant="text"
                      width={80}
                      height={16}
                      sx={{ bgcolor: colors.border_color }}
                    />
                    <Skeleton
                      variant="text"
                      width={40}
                      height={16}
                      sx={{ bgcolor: colors.border_color, ml: "auto" }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Budget & Insights Row */}
        <Grid container spacing={2} sx={{ marginBottom: 3 }}>
          {/* Budget Status Skeleton */}
          <Grid item xs={12} md={6}>
            <Box sx={{ ...cardStyle, height: 220 }}>
              <Skeleton
                variant="text"
                width={150}
                height={24}
                sx={{ bgcolor: colors.border_color, mb: 2 }}
              />
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Skeleton
                    variant="text"
                    width={100}
                    height={20}
                    sx={{ bgcolor: colors.border_color }}
                  />
                  <Skeleton
                    variant="text"
                    width={60}
                    height={20}
                    sx={{ bgcolor: colors.border_color }}
                  />
                </Box>
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={12}
                  sx={{ bgcolor: colors.border_color, borderRadius: "6px" }}
                />
              </Box>
              <Grid container spacing={2}>
                {[1, 2, 3].map((item) => (
                  <Grid item xs={4} key={item}>
                    <Skeleton
                      variant="text"
                      width="80%"
                      height={16}
                      sx={{ bgcolor: colors.border_color }}
                    />
                    <Skeleton
                      variant="text"
                      width="60%"
                      height={24}
                      sx={{ bgcolor: colors.border_color }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>

          {/* Insights Panel Skeleton */}
          <Grid item xs={12} md={6}>
            <Box sx={{ ...cardStyle, height: 220 }}>
              <Skeleton
                variant="text"
                width={120}
                height={24}
                sx={{ bgcolor: colors.border_color, mb: 2 }}
              />
              {[1, 2, 3].map((item) => (
                <Box
                  key={item}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                    mb: 1.5,
                    p: 1,
                    borderRadius: "8px",
                    backgroundColor: colors.secondary_bg,
                  }}
                >
                  <Skeleton
                    variant="circular"
                    width={24}
                    height={24}
                    sx={{ bgcolor: colors.border_color }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton
                      variant="text"
                      width="90%"
                      height={18}
                      sx={{ bgcolor: colors.border_color }}
                    />
                    <Skeleton
                      variant="text"
                      width="50%"
                      height={14}
                      sx={{ bgcolor: colors.border_color }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Expense Highlights Row */}
        <Grid container spacing={2} sx={{ marginBottom: 3 }}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} md={4} key={item}>
              <Box sx={cardStyle}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 2,
                  }}
                >
                  <Skeleton
                    variant="circular"
                    width={36}
                    height={36}
                    sx={{ bgcolor: colors.border_color }}
                  />
                  <Skeleton
                    variant="text"
                    width={100}
                    height={20}
                    sx={{ bgcolor: colors.border_color }}
                  />
                </Box>
                <Skeleton
                  variant="text"
                  width="70%"
                  height={28}
                  sx={{ bgcolor: colors.border_color, mb: 1 }}
                />
                <Skeleton
                  variant="text"
                  width="50%"
                  height={18}
                  sx={{ bgcolor: colors.border_color }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Transactions Table Skeleton */}
        <Box sx={{ ...cardStyle, mb: 2 }}>
          <Skeleton
            variant="text"
            width={180}
            height={24}
            sx={{ bgcolor: colors.border_color, mb: 2 }}
          />
          {/* Table Header */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              pb: 1,
              borderBottom: `1px solid ${colors.border_color}`,
              mb: 1,
            }}
          >
            {[25, 15, 15, 20, 25].map((width, idx) => (
              <Skeleton
                key={idx}
                variant="text"
                width={`${width}%`}
                height={20}
                sx={{ bgcolor: colors.border_color }}
              />
            ))}
          </Box>
          {/* Table Rows */}
          {[1, 2, 3, 4, 5].map((row) => (
            <Box
              key={row}
              sx={{
                display: "flex",
                gap: 2,
                py: 1,
                borderBottom: `1px solid ${colors.border_color}`,
              }}
            >
              {[25, 15, 15, 20, 25].map((width, idx) => (
                <Skeleton
                  key={idx}
                  variant="text"
                  width={`${width}%`}
                  height={18}
                  sx={{ bgcolor: colors.border_color }}
                />
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </div>
  );
};

export default CategoryAnalyticsSkeleton;
