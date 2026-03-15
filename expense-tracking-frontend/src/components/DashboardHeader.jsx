import React from "react";
import PropTypes from "prop-types";
import { useTheme } from "../hooks/useTheme";
import ReportActionMenu from "./common/ReportActionMenu";

/**
 * DashboardHeader
 * Reusable header for dashboard-like pages.
 * Shows title/subtitle and an action menu with refresh/export (and optional filter hook).
 */
const DashboardHeader = ({
  title = "💰 Financial Dashboard",
  subtitle = "Real-time insights into your financial health",
  onRefresh,
  onExport,
  onFilter,
  onCustomize,
}) => {
  const { colors, mode } = useTheme();

  return (
    <div 
      className="dashboard-header"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 24px",
        background: mode === "dark" 
          ? `linear-gradient(135deg, rgba(31,41,55,0.8) 0%, rgba(17,24,39,0.8) 100%)`
          : `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(243,244,246,0.9) 100%)`,
        borderBottom: `1px solid ${colors.border_color}`,
        borderRadius: "16px",
        marginBottom: "24px",
        boxShadow: mode === "dark" ? "0 4px 20px rgba(0,0,0,0.2)" : "0 4px 20px rgba(0,0,0,0.05)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="header-left">
        <div className="header-title">
          <h1 style={{ 
            color: colors.primary_accent, 
            margin: 0, 
            fontSize: "24px", 
            fontWeight: "700",
            letterSpacing: "-0.5px"
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ 
              color: colors.secondary_text, 
              margin: "4px 0 0 0", 
              fontSize: "14px",
              fontWeight: "500"
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="header-actions" style={{ display: "flex", alignItems: "center" }}>
        <ReportActionMenu
          onRefresh={onRefresh}
          onExport={onExport}
          onFilter={onFilter}
          onCustomize={onCustomize}
        />
      </div>
    </div>
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