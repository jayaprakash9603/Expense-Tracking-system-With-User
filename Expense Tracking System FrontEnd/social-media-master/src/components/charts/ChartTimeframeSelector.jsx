import React from "react";
import PropTypes from "prop-types";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";

/**
 * ChartTimeframeSelector - Dropdown for selecting chart timeframe
 *
 * @param {string} value - Currently selected timeframe value
 * @param {function} onChange - Callback when timeframe changes
 * @param {Array} options - Array of timeframe options { value, label }
 */
const ChartTimeframeSelector = ({ value, onChange, options }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

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
      {options.map((opt) => {
        const optionLabel = opt.labelKey
          ? t(opt.labelKey)
          : opt.label || opt.value;
        return (
          <option key={opt.value} value={opt.value}>
            {optionLabel}
          </option>
        );
      })}
    </select>
  );
};

ChartTimeframeSelector.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string,
      labelKey: PropTypes.string,
    })
  ),
};

ChartTimeframeSelector.defaultProps = {
  options: [
    {
      value: "this_month",
      labelKey: "dashboard.charts.timeframeOptions.thisMonth",
    },
    {
      value: "last_month",
      labelKey: "dashboard.charts.timeframeOptions.lastMonth",
    },
    {
      value: "last_3_months",
      labelKey: "dashboard.charts.timeframeOptions.last3Months",
    },
  ],
};

export default ChartTimeframeSelector;
