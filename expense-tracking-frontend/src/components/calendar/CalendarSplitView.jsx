import React from "react";
import { Box } from "@mui/material";

/**
 * Reusable animated split-view for calendar pages.
 * - Desktop: calendar left, details sidebar right (animates open/closed)
 * - Mobile: stacks vertically
 */
export default function CalendarSplitView({
  isSmallScreen,
  sidebarOpen,
  sidebar,
  calendar,
  sidebarWidth = 420,
  // Use CSS pixels (not theme spacing) to avoid unexpected huge gaps.
  // Example: desktopGap={20} means 20px (NOT 20 * theme.spacing).
  desktopGap = 10,
  mobileGap = 2,
  height,
  calendarWidthWhenSidebarOpen,
}) {
  const resolvedDesktopGap =
    typeof desktopGap === "number" ? `${desktopGap}px` : desktopGap;
  const gap = isSmallScreen ? mobileGap : sidebarOpen ? resolvedDesktopGap : 0;
  const calendarWidth =
    !isSmallScreen && sidebarOpen && calendarWidthWhenSidebarOpen
      ? calendarWidthWhenSidebarOpen
      : "100%";
  const calendarFlex =
    !isSmallScreen && sidebarOpen && calendarWidthWhenSidebarOpen
      ? "0 0 auto"
      : "1 1 auto";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isSmallScreen ? "column" : "row",
        gap,
        height: height ?? (isSmallScreen ? "auto" : "calc(100vh - 100px)"),
        alignItems: "stretch",
      }}
    >
      <Box
        sx={{
          flex: calendarFlex,
          width: calendarWidth,
          minWidth: 0,
          transition: "width 280ms ease, flex 280ms ease",
        }}
      >
        {calendar}
      </Box>

      <Box
        sx={{
          width: isSmallScreen ? "100%" : sidebarOpen ? sidebarWidth : 0,
          minWidth: isSmallScreen ? "100%" : sidebarOpen ? sidebarWidth : 0,
          maxWidth: isSmallScreen ? "100%" : sidebarWidth,
          transition: "width 280ms ease, min-width 280ms ease",
          overflow: "hidden",
          flex: "0 0 auto",
        }}
      >
        {sidebarOpen ? sidebar : null}
      </Box>
    </Box>
  );
}
