import React from "react";
import { useSelector } from "react-redux";
import { getThemeColors } from "../../../../config/themeConfig";
import "../AdminPanel.css";

/**
 * Reusable Admin Panel Container Component
 * Provides consistent styling and layout for all admin pages
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to render inside the container
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Additional inline styles
 */
const AdminPanelContainer = ({ children, className = "", style = {} }) => {
  const { mode } = useSelector((state) => state.theme || {});
  const themeColors = getThemeColors(mode);

  return (
    <div
      className={`admin-panel-container ${className}`}
      style={{
        backgroundColor: themeColors.secondary_bg,
        color: themeColors.primary_text,
        border: `1px solid ${themeColors.border}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default AdminPanelContainer;
