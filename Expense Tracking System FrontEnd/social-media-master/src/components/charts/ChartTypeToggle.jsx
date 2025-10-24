import React from "react";
import PropTypes from "prop-types";
import { useTheme } from "../../hooks/useTheme";

/**
 * ChartTypeToggle - Toggle buttons for switching between chart types (Loss/Gain)
 *
 * @param {string} selectedType - Currently selected type
 * @param {function} onToggle - Callback when type changes
 * @param {Array} options - Array of type options { value, label, color }
 */
const ChartTypeToggle = ({ selectedType, onToggle, options }) => {
  const { colors } = useTheme();

  if (!onToggle || !options || options.length === 0) return null;

  return (
    <div className="type-toggle">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`toggle-btn ${opt.value} ${
            selectedType === opt.value ? "active" : ""
          }`}
          onClick={() => onToggle(opt.value)}
          aria-pressed={selectedType === opt.value}
          style={{
            backgroundColor:
              selectedType === opt.value ? opt.color : colors.button_bg,
            color: selectedType === opt.value ? "white" : colors.button_text,
            border: `2px solid ${
              selectedType === opt.value ? opt.color : colors.border_color
            }`,
            fontWeight: selectedType === opt.value ? 700 : 500,
            transform: selectedType === opt.value ? "scale(1.05)" : "scale(1)",
            boxShadow:
              selectedType === opt.value
                ? `0 0 0 3px ${opt.color}20, 0 2px 8px ${opt.color}40`
                : "none",
            transition: "all 0.2s ease",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

ChartTypeToggle.propTypes = {
  selectedType: PropTypes.string.isRequired,
  onToggle: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      color: PropTypes.string,
    })
  ),
};

ChartTypeToggle.defaultProps = {
  options: [
    { value: "loss", label: "Loss", color: "#ff5252" },
    { value: "gain", label: "Gain", color: "#14b8a6" },
  ],
};

export default ChartTypeToggle;
