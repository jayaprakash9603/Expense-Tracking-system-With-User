import React from "react";
import { useTheme } from "../../../../hooks/useTheme";
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
  const { colors } = useTheme();

  return (
    <div
      className={`admin-panel-container ${className}`}
      style={{
        backgroundColor: colors.secondary_bg,
        color: colors.primary_text,
        border: `1px solid ${colors.border}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default AdminPanelContainer;
