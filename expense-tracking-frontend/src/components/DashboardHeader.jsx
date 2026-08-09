import React from "react";
import PropTypes from "prop-types";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "../hooks/useTheme";
import ReportActionMenu from "./common/ReportActionMenu";

/**
 * DashboardHeader
 * Compact, responsive header: title + subtitle on the left, actions on the right.
 * On small screens stays a single horizontal bar (no stacked/centered menu).
 */
const DashboardHeader = ({
  title,
  subtitle = "Real-time insights into your financial health",
  onRefresh,
  onExport,
  onFilter,
  onCustomize,
}) => {
  const { colors, mode } = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:900px)");

  const defaultTitle = (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isMobile ? 6 : 8,
        minWidth: 0,
      }}
    >
      <span
        aria-hidden
        style={{
          width: isMobile ? 28 : 36,
          height: isMobile ? 28 : 36,
          borderRadius: "50%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          background: `${colors.primary_accent}22`,
          color: colors.primary_accent,
        }}
      >
        <MonetizationOnIcon sx={{ fontSize: isMobile ? 16 : 22 }} />
      </span>
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        Financial Dashboard
      </span>
    </span>
  );

  return (
    <header
      className={`dashboard-header${isMobile ? " is-mobile" : ""}${
        isTablet ? " is-tablet" : ""
      }`}
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: isMobile ? 8 : 16,
        padding: isMobile ? "12px 12px" : isTablet ? "14px 16px" : "18px 22px",
        background:
          mode === "dark"
            ? "linear-gradient(135deg, rgba(31,41,55,0.85) 0%, rgba(17,24,39,0.9) 100%)"
            : "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(243,244,246,0.95) 100%)",
        border: `1px solid ${colors.border_color}`,
        borderBottom: `1px solid ${colors.border_color}`,
        borderRadius: isMobile ? "12px" : "16px",
        marginBottom: isMobile ? 12 : 20,
        boxShadow:
          mode === "dark"
            ? "0 4px 16px rgba(0,0,0,0.22)"
            : "0 4px 16px rgba(0,0,0,0.05)",
        backdropFilter: "blur(10px)",
        width: "100%",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <div
        className="header-left"
        style={{ flex: "1 1 auto", minWidth: 0, paddingRight: 8 }}
      >
        <div className="header-title">
          <h1
            style={{
              color: colors.primary_accent,
              margin: 0,
              fontSize: isMobile ? "1rem" : isTablet ? "1.25rem" : "1.5rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
              display: "flex",
              alignItems: "center",
              minWidth: 0,
            }}
          >
            {title ?? defaultTitle}
          </h1>
          {subtitle && (
            <p
              style={{
                color: colors.secondary_text,
                margin: isMobile ? "2px 0 0 34px" : "4px 0 0 44px",
                fontSize: isMobile ? "11px" : "13px",
                fontWeight: 500,
                lineHeight: 1.35,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: isMobile ? "nowrap" : "normal",
                maxWidth: "100%",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div
        className="header-actions"
        style={{
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          marginLeft: "auto",
        }}
      >
        <ReportActionMenu
          onRefresh={onRefresh}
          onExport={onExport}
          onFilter={onFilter}
          onCustomize={onCustomize}
          buttonSize={isMobile ? "small" : "medium"}
          ariaLabel="Dashboard actions"
        />
      </div>
    </header>
  );
};

DashboardHeader.propTypes = {
  title: PropTypes.node,
  subtitle: PropTypes.node,
  onRefresh: PropTypes.func,
  onExport: PropTypes.func,
  onFilter: PropTypes.func,
  onCustomize: PropTypes.func,
};

export default DashboardHeader;
