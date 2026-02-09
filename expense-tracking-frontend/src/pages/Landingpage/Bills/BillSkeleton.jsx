import React from "react";
import { Box, Skeleton, Grid } from "@mui/material";
import { useTheme as useAppTheme } from "../../../hooks/useTheme";

const buildPlaceholders = (count) => Array.from({ length: count });

const SummarySkeleton = ({ colors, mode }) => (
  <Box
    sx={{
      mt: 2,
      borderRadius: "12px",
      boxShadow:
        mode === "dark"
          ? "0 6px 22px rgba(0,0,0,0.45)"
          : "0 6px 16px rgba(15,23,42,0.12)",
      backgroundColor: colors.secondary_bg,
      border: `1px solid ${colors.border_color}`,
      p: 2,
    }}
  >
    <Grid container spacing={2}>
      {buildPlaceholders(4).map((_, idx) => (
        <Grid item xs={6} sm={3} key={`bill-summary-skeleton-${idx}`}>
          <Box
            sx={{
              borderRadius: "10px",
              border: `1px solid ${colors.border_color}`,
              backgroundColor: colors.primary_bg,
              p: 1.5,
              textAlign: "center",
            }}
          >
            <Skeleton
              variant="circular"
              width={40}
              height={40}
              sx={{ bgcolor: colors.hover_bg, mx: "auto", mb: 1 }}
            />
            <Skeleton
              variant="text"
              width="60%"
              height={16}
              sx={{ bgcolor: colors.hover_bg, mx: "auto", mb: 0.5 }}
            />
            <Skeleton
              variant="text"
              width="70%"
              height={26}
              sx={{ bgcolor: colors.hover_bg, mx: "auto" }}
            />
          </Box>
        </Grid>
      ))}
    </Grid>
  </Box>
);

const ListSkeleton = ({ count, colors, mode }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    {buildPlaceholders(count).map((_, idx) => (
      <Box
        key={`bill-skeleton-${idx}`}
        sx={{
          borderRadius: "12px",
          border: `1px solid ${colors.border_color}`,
          backgroundColor: colors.primary_bg,
          boxShadow:
            mode === "dark"
              ? "0 6px 18px rgba(0,0,0,0.4)"
              : "0 6px 18px rgba(15,23,42,0.1)",
          px: 2,
          py: 1.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 1.5,
          }}
        >
          <Skeleton
            variant="circular"
            width={40}
            height={40}
            sx={{ bgcolor: colors.hover_bg }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton
              variant="text"
              width="45%"
              height={20}
              sx={{ bgcolor: colors.hover_bg, borderRadius: 1 }}
            />
            <Skeleton
              variant="text"
              width="65%"
              height={16}
              sx={{
                bgcolor: colors.hover_bg,
                opacity: 0.75,
                borderRadius: 1,
              }}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Skeleton
              variant="rounded"
              width={60}
              height={18}
              sx={{
                bgcolor: colors.hover_bg,
                borderRadius: "999px",
              }}
            />
            <Skeleton
              variant="text"
              width={80}
              height={22}
              sx={{
                bgcolor: colors.hover_bg,
                borderRadius: 1,
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Skeleton
            variant="text"
            width="32%"
            height={16}
            sx={{ bgcolor: colors.hover_bg, borderRadius: 1 }}
          />
          <Skeleton
            variant="text"
            width="28%"
            height={16}
            sx={{ bgcolor: colors.hover_bg, borderRadius: 1 }}
          />
          <Skeleton
            variant="text"
            width="24%"
            height={16}
            sx={{ bgcolor: colors.hover_bg, borderRadius: 1 }}
          />
        </Box>
      </Box>
    ))}
  </Box>
);

const BillSkeleton = ({ count = 4, variant = "list" }) => {
  const { colors, mode } = useAppTheme();

  if (variant === "summary") {
    return <SummarySkeleton colors={colors} mode={mode} />;
  }

  return <ListSkeleton count={count} colors={colors} mode={mode} />;
};

export default BillSkeleton;
