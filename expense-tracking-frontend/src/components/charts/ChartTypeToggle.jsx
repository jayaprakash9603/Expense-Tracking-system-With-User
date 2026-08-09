import React from "react";
import PropTypes from "prop-types";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";

/**
 * ChartTypeToggle - Toggle buttons for switching between chart types (Loss/Gain)
 *
 * @param {string} selectedType - Currently selected type
 * @param {function} onToggle - Callback when type changes
 * @param {Array} options - Array of type options { value, label, color }
 * @param {boolean} compact - Smaller padding/type for dense chart headers
 */
const ChartTypeToggle = ({ selectedType, onToggle, options, compact }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  if (!onToggle || !options || options.length === 0) return null;

  return (
    <div
      className={`type-toggle${compact ? " is-compact" : ""}`}
      style={{
        display: "inline-flex",
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "nowrap",
        gap: compact ? 2 : 4,
        padding: compact ? 2 : undefined,
      }}
    >
      {options.map((opt) => {
        const label = opt.labelKey ? t(opt.labelKey) : opt.label || opt.value;

        return (
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
                selectedType === opt.value ? opt.color : colors.button_inactive,
              color: selectedType === opt.value ? "white" : colors.primary_text,
              border: `2px solid ${
                selectedType === opt.value ? opt.color : colors.border_color
              }`,
              fontWeight: selectedType === opt.value ? 700 : 500,
              transform: selectedType === opt.value && !compact ? "scale(1.05)" : "scale(1)",
              boxShadow:
                selectedType === opt.value && !compact
                  ? `0 0 0 3px ${opt.color}20, 0 2px 8px ${opt.color}40`
                  : selectedType === opt.value
                    ? `0 0 0 2px ${opt.color}25`
                    : "none",
              transition: "all 0.2s ease",
              padding: compact ? "3px 6px" : undefined,
              fontSize: compact ? 10 : undefined,
              minHeight: compact ? 28 : undefined,
              borderRadius: compact ? 5 : undefined,
              lineHeight: 1.2,
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

ChartTypeToggle.propTypes = {
  selectedType: PropTypes.string.isRequired,
  onToggle: PropTypes.func,
  compact: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string,
      labelKey: PropTypes.string,
      color: PropTypes.string,
    })
  ),
};

ChartTypeToggle.defaultProps = {
  compact: false,
  options: [
    {
      value: "loss",
      labelKey: "dashboard.charts.typeOptions.loss",
      color: "#ff5252",
    },
    {
      value: "gain",
      labelKey: "dashboard.charts.typeOptions.gain",
      color: "#14b8a6",
    },
  ],
};

export default ChartTypeToggle;
