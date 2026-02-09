import React from "react";
import FlowStackedChart from "../common/FlowStackedChart";

/**
 * CategoryFlowChart
 * Wrapper around FlowStackedChart for CategoryFlow page.
 * Props: stackedChartData, barSegments, xAxisKey, isMobile, isTablet, formatCompactNumber, onSegmentClick
 */
const CategoryFlowChart = ({
  stackedChartData,
  barSegments,
  xAxisKey,
  isMobile,
  isTablet,
  formatCompactNumber,
  onSegmentClick,
}) => {
  return (
    <FlowStackedChart
      stackedChartData={stackedChartData}
      barSegments={barSegments}
      xAxisKey={xAxisKey}
      isMobile={isMobile}
      isTablet={isTablet}
      formatCompactNumber={formatCompactNumber}
      onSegmentClick={onSegmentClick}
      accentColor="#14b8a6"
    />
  );
};

export default CategoryFlowChart;
