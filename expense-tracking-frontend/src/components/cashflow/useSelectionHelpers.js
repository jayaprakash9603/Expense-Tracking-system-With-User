import { useCallback } from "react";

/**
 * Provides helpers related to selection coloring & hit area logic.
 */
export default function useSelectionHelpers(flowTab) {
  const getFlowBaseRGBA = useCallback(() => {
    return flowTab === "outflow"
      ? "255,77,79"
      : flowTab === "inflow"
      ? "6,214,160"
      : "91,127,255";
  }, [flowTab]);

  const getSelectedFill = useCallback(() => {
    return flowTab === "outflow"
      ? "#ff4d4f"
      : flowTab === "inflow"
      ? "#06d6a0"
      : "#5b7fff";
  }, [flowTab]);

  return { getFlowBaseRGBA, getSelectedFill };
}
