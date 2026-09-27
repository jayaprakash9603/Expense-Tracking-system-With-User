import React from "react";
import { useTheme } from "../../../hooks/useTheme";
import "../styles/AdminPanel.css";

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
        backgroundColor: "var(--color-secondary-bg)",
        color: "var(--color-primary-text)",
        border: "1px solid var(--color-border-color)",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default AdminPanelContainer;
