import React from "react";
import { Box, Grid, Skeleton } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";
import PageHeader from "../PageHeader";

/**
 * Skeleton loader for CategoryAnalyticsView
 * Matches the two-column layout: Left Sidebar (280px) + Right Content Area
 */
const CategoryAnalyticsSkeleton = ({ onClose, containerStyle }) => {
  const { colors } = useTheme();

  const cardStyle = {
    backgroundColor: colors.primary_bg,
    borderRadius: "12px",
    border: `1px solid ${colors.border_color}`,
    padding: "12px",
  };

  return (
    <div className="flex flex-col relative" style={containerStyle}>
      {/* Header Skeleton */}
      <PageHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Skeleton
              variant="rounded"
              width={36}
              height={36}
              sx={{ bgcolor: colors.border_color, borderRadius: "8px" }}
            />
            <Skeleton
              variant="text"
              width={140}
              height={28}
              sx={{ bgcolor: colors.border_color }}
            />
          </Box>
        }
        onClose={onClose}
        rightContent={
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Skeleton
              variant="rounded"
              width={100}
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
              variant="rounded"
              width={36}
              height={36}
              sx={{ bgcolor: colors.border_color }}
            />
            <Skeleton
              variant="rounded"
              width={36}
              height={36}
              sx={{ bgcolor: colors.border_color }}
            />
          </Box>
        }
      />

      {/* Main Content - Two Column Layout */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          gap: 1.5,
          overflow: "hidden",
        }}
      >
        {/* LEFT COLUMN - 280px Sidebar */}
        <Box
          sx={{
            width: "280px",
            minWidth: "280px",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          {/* Category Details Card - Hero Style */}
          <Box
            sx={{
              ...cardStyle,
              padding: "14px 16px",
              border: `2px solid ${colors.border_color}`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Accent stripe */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                bgcolor: colors.border_color,
              }}
            />
            {/* Amount */}
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}
            >
              <Skeleton
                variant="text"
                width={120}
                height={36}
                sx={{ bgcolor: colors.border_color }}
              />
              <Skeleton
                variant="rounded"
                width={50}
                height={22}
                sx={{ bgcolor: colors.border_color }}
              />
            </Box>
            {/* Progress Bar */}
            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Skeleton
                  variant="rounded"
                  width="100%"
                  height={8}
                  sx={{ bgcolor: colors.border_color, borderRadius: "4px" }}
                />
                <Skeleton
                  variant="text"
                  width={45}
                  height={20}
                  sx={{ bgcolor: colors.border_color }}
                />
              </Box>
              <Skeleton
                variant="text"
                width={80}
                height={14}
                sx={{ bgcolor: colors.border_color, mt: 0.5 }}
              />
            </Box>
            {/* Comments Section */}
            <Box
              sx={{
                backgroundColor: colors.secondary_bg,
                padding: "8px 10px",
                borderRadius: "8px",
                border: `1px solid ${colors.border_color}`,
                borderLeft: `3px solid ${colors.border_color}`,
              }}
            >
              <Skeleton
                variant="text"
                width="80%"
                height={18}
                sx={{ bgcolor: colors.border_color }}
              />
            </Box>
          </Box>

          {/* Payment Distribution Pie Chart */}
          <Box sx={{ ...cardStyle, minHeight: "200px" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 160,
              }}
            >
              <Skeleton
                variant="circular"
                width={140}
                height={140}
                sx={{ bgcolor: colors.border_color }}
              />
            </Box>
            {/* Legend */}
            <Box sx={{ mt: 1 }}>
              {[1, 2, 3].map((item) => (
                <Box
                  key={item}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <Skeleton
                    variant="circular"
                    width={10}
                    height={10}
                    sx={{ bgcolor: colors.border_color }}
                  />
                  <Skeleton
                    variant="text"
                    width={60}
                    height={14}
                    sx={{ bgcolor: colors.border_color }}
                  />
                  <Skeleton
                    variant="text"
                    width={30}
                    height={14}
                    sx={{ bgcolor: colors.border_color, ml: "auto" }}
                  />
                </Box>
              ))}
            </Box>
          </Box>

          {/* Recent Transactions */}
          <Box
            sx={{
              ...cardStyle,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <Skeleton
              variant="text"
              width={140}
              height={20}
              sx={{ bgcolor: colors.border_color, mb: 1 }}
            />
            <Box sx={{ flex: 1, overflow: "hidden" }}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Box
                  key={item}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "6px 8px",
                    mb: 0.5,
                    backgroundColor: `${colors.secondary_bg}80`,
                    borderRadius: "6px",
                    borderLeft: `3px solid ${colors.border_color}`,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Skeleton
                      variant="text"
                      width="70%"
                      height={16}
                      sx={{ bgcolor: colors.border_color }}
                    />
                    <Skeleton
                      variant="text"
                      width="40%"
                      height={12}
                      sx={{ bgcolor: colors.border_color }}
                    />
                  </Box>
                  <Skeleton
                    variant="text"
                    width={50}
                    height={18}
                    sx={{ bgcolor: colors.border_color }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* RIGHT CONTENT AREA */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            minWidth: 0,
          }}
        >
          {/* Occurrence Statistics - 2 Rows of 4 Cards */}
          <Grid container spacing={1.5}>
            {/* Row 1 */}
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={3} key={`row1-${item}`}>
                <Box
                  sx={{
                    ...cardStyle,
                    height: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mb: 0.5,
                    }}
                  >
                    <Skeleton
                      variant="text"
                      width={16}
                      height={16}
                      sx={{ bgcolor: colors.border_color }}
                    />
                    <Skeleton
                      variant="text"
                      width={60}
                      height={14}
                      sx={{ bgcolor: colors.border_color }}
                    />
                  </Box>
                  <Skeleton
                    variant="text"
                    width={80}
                    height={28}
                    sx={{ bgcolor: colors.border_color }}
                  />
                </Box>
              </Grid>
            ))}
            {/* Row 2 */}
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={3} key={`row2-${item}`}>
                <Box
                  sx={{
                    ...cardStyle,
                    height: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mb: 0.5,
                    }}
                  >
                    <Skeleton
                      variant="text"
                      width={16}
                      height={16}
                      sx={{ bgcolor: colors.border_color }}
                    />
                    <Skeleton
                      variant="text"
                      width={60}
                      height={14}
                      sx={{ bgcolor: colors.border_color }}
                    />
                  </Box>
                  <Skeleton
                    variant="text"
                    width={80}
                    height={28}
                    sx={{ bgcolor: colors.border_color }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Monthly Spending Chart */}
          <Box sx={{ ...cardStyle, flex: 1, minHeight: "200px" }}>
            <Skeleton
              variant="text"
              width={180}
              height={20}
              sx={{ bgcolor: colors.border_color, mb: 1 }}
            />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={160}
              sx={{ bgcolor: colors.border_color, borderRadius: "8px" }}
            />
          </Box>

          {/* Bottom Row: Linked Budgets | Insights | Overview & Patterns */}
          <Grid container spacing={1.5} sx={{ flex: 1, minHeight: 0 }}>
            {/* Linked Budgets */}
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  ...cardStyle,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Skeleton
                      variant="text"
                      width={16}
                      height={16}
                      sx={{ bgcolor: colors.border_color }}
                    />
                    <Skeleton
                      variant="text"
                      width={100}
                      height={18}
                      sx={{ bgcolor: colors.border_color }}
                    />
                  </Box>
                  <Skeleton
                    variant="text"
                    width={40}
                    height={14}
                    sx={{ bgcolor: colors.border_color }}
                  />
                </Box>
                {/* Budget List Items */}
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  {[1, 2, 3].map((item) => (
                    <Box
                      key={item}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 8px",
                        backgroundColor: colors.secondary_bg,
                        borderRadius: "6px",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Skeleton
                          variant="circular"
                          width={24}
                          height={24}
                          sx={{ bgcolor: colors.border_color }}
                        />
                        <Skeleton
                          variant="text"
                          width={80}
                          height={16}
                          sx={{ bgcolor: colors.border_color }}
                        />
                      </Box>
                      <Skeleton
                        variant="text"
                        width={50}
                        height={16}
                        sx={{ bgcolor: colors.border_color }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Insights Panel */}
            <Grid item xs={12} md={3.5}>
              <Box
                sx={{
                  ...cardStyle,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <Skeleton
                    variant="text"
                    width={16}
                    height={16}
                    sx={{ bgcolor: colors.border_color }}
                  />
                  <Skeleton
                    variant="text"
                    width={60}
                    height={18}
                    sx={{ bgcolor: colors.border_color }}
                  />
                </Box>
                {/* Insight Items */}
                {[1, 2, 3].map((item) => (
                  <Box
                    key={item}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                      mb: 0.5,
                      p: 0.5,
                      borderRadius: "6px",
                      backgroundColor: colors.secondary_bg,
                    }}
                  >
                    <Skeleton
                      variant="circular"
                      width={20}
                      height={20}
                      sx={{ bgcolor: colors.border_color }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton
                        variant="text"
                        width="90%"
                        height={14}
                        sx={{ bgcolor: colors.border_color }}
                      />
                      <Skeleton
                        variant="text"
                        width="60%"
                        height={12}
                        sx={{ bgcolor: colors.border_color }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>

            {/* Overview & Patterns */}
            <Grid item xs={12} md={3.5}>
              <Box
                sx={{
                  ...cardStyle,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <Skeleton
                    variant="text"
                    width={16}
                    height={16}
                    sx={{ bgcolor: colors.border_color }}
                  />
                  <Skeleton
                    variant="text"
                    width={80}
                    height={18}
                    sx={{ bgcolor: colors.border_color }}
                  />
                </Box>
                {/* Overview Items */}
                {[1, 2, 3].map((item) => (
                  <Box
                    key={item}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 0.5,
                      p: 0.5,
                      borderRadius: "6px",
                      backgroundColor: colors.secondary_bg,
                    }}
                  >
                    <Skeleton
                      variant="text"
                      width={80}
                      height={14}
                      sx={{ bgcolor: colors.border_color }}
                    />
                    <Skeleton
                      variant="text"
                      width={40}
                      height={16}
                      sx={{ bgcolor: colors.border_color }}
                    />
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </div>
  );
};

export default CategoryAnalyticsSkeleton;
