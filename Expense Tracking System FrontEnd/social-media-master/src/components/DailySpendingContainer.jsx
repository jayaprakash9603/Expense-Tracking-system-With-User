import React, { useEffect } from "react";
import PropTypes from "prop-types";
import useDailySpendingData from "../hooks/useDailySpendingData";
import { DailySpendingChart, DailySpendingSkeleton } from "../pages/Dashboard";

/**
 * DailySpendingContainer
 * Bridges the new data hook and existing chart component.
 * Provides local timeframe/type state unless controlled via props.
 */
const DailySpendingContainer = ({
  timeframe: controlledTimeframe,
  type: controlledType,
  onTimeframeChange,
  onTypeChange,
  height,
  skeletonHeight = 240,
  refreshTrigger,
}) => {
  const { data, loading, timeframe, type, setTimeframe, setType, refetch } =
    useDailySpendingData({
      initialTimeframe: controlledTimeframe,
      initialType: controlledType,
      refreshTrigger,
    });

  // Sync controlled prop changes (if parent manages state) into hook state
  useEffect(() => {
    if (controlledTimeframe && controlledTimeframe !== timeframe) {
      setTimeframe(controlledTimeframe);
      refetch();
    }
  }, [controlledTimeframe]);
  useEffect(() => {
    if (controlledType && controlledType !== type) {
      setType(controlledType);
      refetch();
    }
  }, [controlledType]);

  const handleTimeframe = (val) => {
    if (onTimeframeChange) onTimeframeChange(val);
    setTimeframe(val);
  };
  const handleType = (val) => {
    if (onTypeChange) onTypeChange(val);
    setType(val);
  };

  if (loading) {
    return (
      <DailySpendingSkeleton
        timeframe={timeframe}
        height={height || skeletonHeight}
      />
    );
  }

  return (
    <DailySpendingChart
      data={data}
      timeframe={timeframe}
      onTimeframeChange={handleTimeframe}
      selectedType={type}
      onTypeToggle={handleType}
    />
  );
};

DailySpendingContainer.propTypes = {
  timeframe: PropTypes.string,
  type: PropTypes.string,
  onTimeframeChange: PropTypes.func,
  onTypeChange: PropTypes.func,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  skeletonHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  refreshTrigger: PropTypes.any,
};

export default DailySpendingContainer;
