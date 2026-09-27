import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "../../hooks/useTranslation";
import { AppSelect } from "../ui";

/**
 * ChartTimeframeSelector - Compact AppSelect for chart timeframe filters
 */
const ChartTimeframeSelector = ({
  value,
  onChange,
  options,
  ariaLabel = "Timeframe",
  compact = true,
}) => {
  const { t } = useTranslation();

  const mappedOptions = useMemo(() => {
    if (!options?.length) return [];
    return options.map((opt) => ({
      value: opt.value,
      label: opt.labelKey ? t(opt.labelKey) : opt.label || opt.value,
      disabled: opt.disabled,
    }));
  }, [options, t]);

  if (!onChange || mappedOptions.length === 0) return null;

  return (
    <AppSelect
      className="time-selector chart-timeframe-selector"
      value={value}
      onValueChange={onChange}
      options={mappedOptions}
      ariaLabel={ariaLabel}
      size={compact ? "compact" : "small"}
      density={compact ? "compact" : "comfortable"}
      fullWidth={false}
      displayEmpty={false}
      showSelectedCheck={false}
      preferNativeOnMobile
      sx={{ minWidth: compact ? 96 : 140 }}
    />
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
      disabled: PropTypes.bool,
    }),
  ),
  ariaLabel: PropTypes.string,
  compact: PropTypes.bool,
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
