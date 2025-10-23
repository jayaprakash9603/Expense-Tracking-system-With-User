import React from "react";
import PropTypes from "prop-types";

/**
 * ChartTypeToggle - Toggle buttons for switching between chart types (Loss/Gain)
 *
 * @param {string} selectedType - Currently selected type
 * @param {function} onToggle - Callback when type changes
 * @param {Array} options - Array of type options { value, label, color }
 */
const ChartTypeToggle = ({ selectedType, onToggle, options }) => {
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
