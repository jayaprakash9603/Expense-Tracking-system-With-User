import React from "react";
import { Skeleton, Box, useMediaQuery } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";
import PageHeader from "../PageHeader";

/**
 * ViewExpenseSkeleton - Loading skeleton for ViewExpense component
 */
const ViewExpenseSkeleton = ({ onClose, containerStyle }) => {
  const { colors } = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isCompact = useMediaQuery("(max-width:900px)");

  if (!colors) {
    return null;
  }

  return (
    <div className="flex flex-col relative" style={containerStyle}>
      <PageHeader
        title="View Expense"
        onClose={onClose}
        titleClassName={
          isMobile
            ? "font-extrabold text-xl"
            : isCompact
              ? "font-extrabold text-2xl"
              : "font-extrabold text-4xl"
        }
      />
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: isCompact ? "column" : "row",
          gap: 2,
          overflow: isCompact ? "visible" : "hidden",
          minWidth: 0,
          width: "100%",
        }}
      >
        <Box
          sx={{
            width: isCompact ? "100%" : "340px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            minWidth: 0,
          }}
        >
          <div
            style={{
              backgroundColor: "var(--color-primary-bg)",
              borderRadius: "12px",
              padding: "18px 20px",
              border: "1px solid var(--color-border-color)",
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Skeleton
              variant="rectangular"
              width="100%"
              height={4}
              sx={{ bgcolor: colors.secondary_bg, mb: 2, borderRadius: "2px" }}
            />
            <Skeleton
              variant="text"
              width="70%"
              height={36}
              sx={{ bgcolor: colors.secondary_bg }}
            />
            <div className="flex items-center gap-3 my-3">
              <Skeleton
                variant="rounded"
                width="60%"
                height={52}
                sx={{ bgcolor: colors.secondary_bg }}
              />
              <Skeleton
                variant="rounded"
                width={70}
                height={28}
                sx={{ bgcolor: colors.secondary_bg, borderRadius: "14px" }}
              />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Skeleton
                variant="circular"
                width={16}
                height={16}
                sx={{ bgcolor: colors.secondary_bg }}
              />
              <Skeleton
                variant="text"
                width="40%"
                height={20}
                sx={{ bgcolor: colors.secondary_bg }}
              />
            </div>
            <Skeleton
              variant="rounded"
              width="100%"
              height={60}
              sx={{ bgcolor: colors.secondary_bg, mt: "auto" }}
            />
          </div>
          <Skeleton
            variant="rounded"
            width="100%"
            height={120}
            sx={{ backgroundColor: "var(--color-primary-bg)", borderRadius: "12px" }}
          />
          <Skeleton
            variant="rounded"
            width="100%"
            height={120}
            sx={{ backgroundColor: "var(--color-primary-bg)", borderRadius: "12px" }}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            width: isCompact ? "100%" : "auto",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          <Skeleton
            variant="rounded"
            width="100%"
            height={160}
            sx={{ backgroundColor: "var(--color-primary-bg)", borderRadius: "12px" }}
          />
          <Skeleton
            variant="rounded"
            width="100%"
            height={280}
            sx={{ backgroundColor: "var(--color-primary-bg)", borderRadius: "12px", flex: 1 }}
          />
        </Box>
      </Box>
    </div>
  );
};

export default ViewExpenseSkeleton;
