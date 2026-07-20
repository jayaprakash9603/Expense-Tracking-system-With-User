// Shared chart color palette and helper accessor
// Provides stable ordering and simple reuse across payment & category reports.

export const CHART_COLORS = [
  "#14b8a6",
  "#06d6a0",
  "#118ab2",
  "#ffd166",
  "#f77f00",
  "#e63946",
  "#073b4c",
  "#fcbf49",
  "#f95738",
  "#a8dadc",
  "#457b9d",
  "#1d3557",
];

/**
 * Returns a copy of the shared chart colors (to avoid accidental mutation).
 * Optionally accepts a limit to truncate the palette.
 * @param {number} [limit] - Optional maximum number of colors.
 * @returns {string[]} array of hex color strings
 */
export function getChartColors(limit) {
  if (typeof limit === "number" && limit > 0) {
    return CHART_COLORS.slice(0, limit);
  }
  return [...CHART_COLORS];
}
