import React from "react";
import PropTypes from "prop-types";
import { useTheme } from "../../hooks/useTheme";

/**
 * ChartTimeframeSelector - Dropdown for selecting chart timeframe
 *
 * @param {string} value - Currently selected timeframe value
 * @param {function} onChange - Callback when timeframe changes
 * @param {Array} options - Array of timeframe options { value, label }
 */
const ChartTimeframeSelector = ({ value, onChange, options }) => {
  const { colors } = useTheme();

  if (!onChange || !options || options.length === 0) return null;

  return (
    <select
      className="time-selector"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        backgroundColor: colors.tertiary_bg,
        color: colors.primary_text,
        border: `1px solid ${colors.border_color}`,
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

ChartTimeframeSelector.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
};

ChartTimeframeSelector.defaultProps = {
  options: [
    { value: "this_month", label: "This Month" },
    { value: "last_month", label: "Last Month" },
    { value: "last_3_months", label: "Last 3 Months" },
  ],
};

export default ChartTimeframeSelector;
