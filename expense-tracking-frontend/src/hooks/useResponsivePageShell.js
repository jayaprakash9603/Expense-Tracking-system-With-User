import { useMediaQuery } from "@mui/material";
import { useTheme } from "./useTheme";

/**
 * Shared responsive shell styles for detail/view pages
 * (ViewExpense, Category/Payment analytics, etc.).
 *
 * Avoids fixed `calc(100vw - 370px)` on small screens which collapses content.
 */
const useResponsivePageShell = (overrides = {}) => {
  const { colors } = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:900px)");
  const isCompact = isMobile || isTablet;

  const containerStyle = {
    width: isCompact ? "100%" : "calc(100vw - 370px)",
    maxWidth: "100%",
    height: isCompact ? "auto" : "calc(100vh - 100px)",
    minHeight: isCompact ? "calc(100dvh - 72px)" : undefined,
    backgroundColor: colors.secondary_bg,
    borderRadius: isMobile ? 0 : "8px",
    marginRight: isCompact ? 0 : "20px",
    border: `1px solid ${colors.border_color}`,
    padding: isMobile ? "12px" : isTablet ? "14px 16px" : "16px 24px",
    overflow: isCompact ? "auto" : "hidden",
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    minWidth: 0,
    ...overrides,
  };

  const mainRowSx = {
    flex: 1,
    display: "flex",
    flexDirection: isCompact ? "column" : "row",
    gap: isMobile ? 1.5 : 2,
    overflow: isCompact ? "visible" : "hidden",
    minHeight: 0,
    minWidth: 0,
    width: "100%",
  };

  const sideColumnSx = {
    width: isCompact ? "100%" : "340px",
    minWidth: isCompact ? 0 : "280px",
    maxWidth: isCompact ? "100%" : "340px",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: isMobile ? 1.25 : 1.5,
    boxSizing: "border-box",
  };

  const contentColumnSx = {
    flex: 1,
    minWidth: 0,
    width: isCompact ? "100%" : "auto",
    display: "flex",
    flexDirection: "column",
    gap: isMobile ? 1.25 : 1.5,
    overflow: isCompact ? "visible" : "hidden",
    boxSizing: "border-box",
  };

  return {
    colors,
    isMobile,
    isTablet,
    isCompact,
    containerStyle,
    mainRowSx,
    sideColumnSx,
    contentColumnSx,
  };
};

export default useResponsivePageShell;
