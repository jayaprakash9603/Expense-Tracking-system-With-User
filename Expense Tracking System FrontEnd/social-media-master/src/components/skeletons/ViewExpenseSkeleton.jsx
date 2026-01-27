import React from "react";
import { Skeleton } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";
import PageHeader from "../PageHeader";

/**
 * ViewExpenseSkeleton - Loading skeleton for ViewExpense component
 *
 * @param {Object} props
 * @param {Function} props.onClose - Close handler for the page header
 * @param {Object} props.containerStyle - Container style object
 */
const ViewExpenseSkeleton = ({ onClose, containerStyle }) => {
  const { colors } = useTheme();

  // Guard against undefined colors
  if (!colors) {
    return null;
  }

  return (
    <div className="flex flex-col relative" style={containerStyle}>
      <PageHeader title="View Expense" onClose={onClose} />
      <div className="flex gap-4 flex-1" style={{ overflow: "hidden" }}>
        {/* Left Column Skeleton */}
        <div
          className="flex flex-col gap-3"
          style={{ width: "340px", flexShrink: 0 }}
        >
          {/* Hero Card Skeleton */}
          <div
            style={{
              backgroundColor: colors.primary_bg,
              borderRadius: "12px",
              padding: "18px 20px",
              border: `1px solid ${colors.border_color}`,
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Accent stripe skeleton */}
            <Skeleton
              variant="rectangular"
              width="100%"
              height={4}
              sx={{ bgcolor: colors.secondary_bg, mb: 2, borderRadius: "2px" }}
            />
            {/* Title */}
            <Skeleton
              variant="text"
              width="70%"
              height={36}
              sx={{ bgcolor: colors.secondary_bg }}
            />
            {/* Amount with chip */}
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
            {/* Date */}
            <div className="flex items-center gap-2 mb-3">
              <Skeleton
                variant="circular"
                width={16}
                height={16}
                sx={{ bgcolor: colors.secondary_bg }}
              />
              <Skeleton
                variant="text"
                width={100}
                height={24}
                sx={{ bgcolor: colors.secondary_bg }}
              />
            </div>
            {/* Comments box */}
            <Skeleton
              variant="rounded"
              width="100%"
              height={70}
              sx={{ bgcolor: colors.secondary_bg, mt: "auto" }}
            />
          </div>

          {/* Category Card Skeleton */}
          <div
            style={{
              backgroundColor: colors.primary_bg,
              borderRadius: "12px",
              padding: "14px 16px",
              border: `1px solid ${colors.border_color}`,
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Accent stripe */}
            <Skeleton
              variant="rectangular"
              width="100%"
              height={4}
              sx={{ bgcolor: colors.secondary_bg, mb: 2, borderRadius: "2px" }}
            />
            {/* Header with icon and name */}
            <div className="flex items-center gap-2 mb-3">
              <Skeleton
                variant="rounded"
                width={32}
                height={32}
                sx={{ bgcolor: colors.secondary_bg, borderRadius: "8px" }}
              />
              <Skeleton
                variant="text"
                width={100}
                height={28}
                sx={{ bgcolor: colors.secondary_bg }}
              />
              <Skeleton
                variant="rounded"
                width={50}
                height={22}
                sx={{
                  bgcolor: colors.secondary_bg,
                  marginLeft: "auto",
                  borderRadius: "11px",
                }}
              />
            </div>
            {/* Stats grid */}
            <div
              className="grid grid-cols-2 gap-2"
              style={{ marginTop: "auto" }}
            >
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  height={58}
                  sx={{ bgcolor: colors.secondary_bg }}
                />
              ))}
            </div>
          </div>

          {/* Payment Card Skeleton */}
          <div
            style={{
              backgroundColor: colors.primary_bg,
              borderRadius: "12px",
              padding: "14px 16px",
              border: `1px solid ${colors.border_color}`,
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Accent stripe */}
            <Skeleton
              variant="rectangular"
              width="100%"
              height={4}
              sx={{ bgcolor: colors.secondary_bg, mb: 2, borderRadius: "2px" }}
            />
            {/* Header with icon and name */}
            <div className="flex items-center gap-2 mb-3">
              <Skeleton
                variant="rounded"
                width={32}
                height={32}
                sx={{ bgcolor: colors.secondary_bg, borderRadius: "8px" }}
              />
              <Skeleton
                variant="text"
                width={120}
                height={28}
                sx={{ bgcolor: colors.secondary_bg }}
              />
              <Skeleton
                variant="rounded"
                width={50}
                height={22}
                sx={{
                  bgcolor: colors.secondary_bg,
                  marginLeft: "auto",
                  borderRadius: "11px",
                }}
              />
            </div>
            {/* Stats grid */}
            <div
              className="grid grid-cols-2 gap-2"
              style={{ marginTop: "auto" }}
            >
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  height={58}
                  sx={{ bgcolor: colors.secondary_bg }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div
          className="flex flex-col gap-3 flex-1"
          style={{ overflow: "hidden" }}
        >
          {/* Occurrence Stats Skeleton */}
          <div
            style={{
              backgroundColor: colors.primary_bg,
              borderRadius: "10px",
              padding: "18px 20px",
              border: `1px solid ${colors.border_color}`,
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <Skeleton
                variant="circular"
                width={20}
                height={20}
                sx={{ bgcolor: colors.secondary_bg }}
              />
              <Skeleton
                variant="text"
                width={160}
                height={28}
                sx={{ bgcolor: colors.secondary_bg }}
              />
              <Skeleton
                variant="rounded"
                width={80}
                height={26}
                sx={{
                  bgcolor: colors.secondary_bg,
                  marginLeft: "auto",
                  borderRadius: "13px",
                }}
              />
            </div>
            {/* Stats grid - 8 cards in 4 columns */}
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  height={72}
                  sx={{ bgcolor: colors.secondary_bg }}
                />
              ))}
            </div>
          </div>

          {/* Linked Budgets Skeleton */}
          <div
            style={{
              backgroundColor: colors.primary_bg,
              borderRadius: "8px",
              padding: "14px 16px",
              border: `1px solid ${colors.border_color}`,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <Skeleton
                variant="circular"
                width={16}
                height={16}
                sx={{ bgcolor: colors.secondary_bg }}
              />
              <Skeleton
                variant="text"
                width={120}
                height={24}
                sx={{ bgcolor: colors.secondary_bg }}
              />
              <Skeleton
                variant="rounded"
                width={24}
                height={24}
                sx={{
                  bgcolor: colors.secondary_bg,
                  marginLeft: "auto",
                  borderRadius: "12px",
                }}
              />
            </div>

            {/* Search and filter row */}
            <div className="flex items-center gap-3 mb-3">
              <Skeleton
                variant="rounded"
                width={200}
                height={36}
                sx={{ bgcolor: colors.secondary_bg }}
              />
              <Skeleton
                variant="rounded"
                width={120}
                height={36}
                sx={{ bgcolor: colors.secondary_bg }}
              />
              <Skeleton
                variant="text"
                width={80}
                height={20}
                sx={{ bgcolor: colors.secondary_bg, marginLeft: "auto" }}
              />
            </div>

            {/* Table skeleton */}
            <div
              style={{
                flex: 1,
                borderRadius: "6px",
                border: `1px solid ${colors.border_color}`,
                overflow: "hidden",
              }}
            >
              {/* Header row */}
              <Skeleton
                variant="rectangular"
                width="100%"
                height={42}
                sx={{ bgcolor: colors.secondary_bg }}
              />
              {/* Data rows */}
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  width="100%"
                  height={44}
                  sx={{
                    bgcolor:
                      i % 2 === 0
                        ? colors.primary_bg
                        : colors.secondary_bg + "40",
                    mt: "1px",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewExpenseSkeleton;
