import React from "react";
import { useTheme } from "../../../../hooks/useTheme";

/**
 * Reusable Section Card Component
 * Provides a consistent container for sections within admin pages
 * 
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {React.ReactNode} props.children - Section content
 * @param {React.ReactNode} props.actions - Optional action buttons in header
 * @param {string} props.className - Additional CSS classes
 */
const SectionCard = ({ title, children, actions = null, className = "" }) => {
  const { colors } = useTheme();

  return (
    <div
      className={`p-6 rounded-lg mb-6 ${className}`}
      style={{ backgroundColor: colors.card_bg }}
    >
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h3
            className="text-xl font-semibold"
            style={{ color: colors.primary_text }}
          >
            {title}
          </h3>
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default SectionCard;
