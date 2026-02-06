import React from "react";
import { useTheme } from "../../../../hooks/useTheme";

/**
 * Reusable Admin Page Header Component
 * Displays page title and description with consistent styling
 * 
 * @param {Object} props
 * @param {string} props.title - Main page title
 * @param {string} props.description - Page description/subtitle
 * @param {React.ReactNode} props.actions - Optional action buttons (e.g., Create, Export)
 */
const AdminPageHeader = ({ title, description, actions = null }) => {
  const { colors } = useTheme();

  return (
    <div className="mb-6 flex justify-between items-center">
      <div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: colors.primary_text }}
        >
          {title}
        </h1>
        {description && (
          <p style={{ color: colors.secondary_text }}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
};

export default AdminPageHeader;
