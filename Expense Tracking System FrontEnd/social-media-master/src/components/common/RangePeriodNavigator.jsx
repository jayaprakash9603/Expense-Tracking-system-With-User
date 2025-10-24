import React from "react";
import { Button } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";

/**
 * RangePeriodNavigator
 * Reusable header strip combining:
 *  - Optional back button (friend context aware)
 *  - Range type toggle buttons (week/month/year etc.)
 *  - Previous / Next navigation with current range label
 *
 * Props:
 *  showBackButton: boolean -> whether to render the back button
 *  onBackNavigate: function -> invoked when back button clicked
 *  rangeTypes: array [{ value, label }]
 *  activeRange: current range value
 *  setActiveRange: fn(newValue)
 *  offset: number -> current offset for prev/next disabling logic
 *  handleBack: fn() -> previous period
 *  handleNext: fn() -> next period
 *  rangeLabel: string -> computed label for current period
 *  onResetSelection: optional fn -> invoked when clicking same active range to clear selection
 *  disablePrevAt: number (default -52) -> lower bound for prev button
 *  disableNextAt: number (default 0) -> upper bound for next button
 *  isMobile: boolean to tweak sizing
 */
const RangePeriodNavigator = ({
  showBackButton = false,
  onBackNavigate,
  rangeTypes,
  activeRange,
  setActiveRange,
  offset,
  handleBack,
  handleNext,
  rangeLabel,
  onResetSelection,
  disablePrevAt = -52,
  disableNextAt = 0,
  isMobile = false,
}) => {
  const { colors } = useTheme();

  return (
    <>
      <div
        className="flex items-center mb-4"
        style={{ gap: showBackButton ? 12 : 16 }}
      >
        {showBackButton && (
          <Button
            variant="contained"
            onClick={() => onBackNavigate && onBackNavigate()}
            sx={{
              backgroundColor: colors.primary_bg,
              borderRadius: "8px",
              color: colors.active_text,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              px: 1.5,
              py: 0.75,
              textTransform: "none",
              fontSize: isMobile ? "0.7rem" : "0.8rem",
              minHeight: 36,
              "&:hover": { backgroundColor: colors.hover_bg },
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke={colors.active_text}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </Button>
        )}
        <div
          className="flex items-center"
          style={{ gap: 12, marginLeft: showBackButton ? 4 : 0 }}
        >
          {rangeTypes.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                if (activeRange === tab.value) {
                  onResetSelection && onResetSelection();
                }
                setActiveRange(tab.value);
              }}
              className="px-4 py-2 rounded font-semibold flex items-center gap-2"
              style={{
                backgroundColor:
                  activeRange === tab.value
                    ? colors.button_bg
                    : colors.active_bg,
                color:
                  activeRange === tab.value
                    ? colors.button_text
                    : colors.primary_text,
                transition: "background-color 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={handleBack}
          disabled={offset <= disablePrevAt}
          className="px-3 py-1 rounded text-lg flex items-center"
          style={{
            backgroundColor:
              offset <= disablePrevAt
                ? colors.secondary_text
                : colors.button_bg,
            color:
              offset <= disablePrevAt
                ? colors.border_color
                : colors.button_text,
            cursor: offset <= disablePrevAt ? "not-allowed" : "pointer",
            opacity: offset <= disablePrevAt ? 0.5 : 1,
          }}
          aria-label="Previous"
        >
          &#8592;
        </button>
        <span style={{ color: colors.primary_text, fontSize: "0.875rem" }}>
          {rangeLabel}
        </span>
        <button
          onClick={handleNext}
          disabled={offset >= disableNextAt}
          className="px-3 py-1 rounded text-lg flex items-center"
          style={{
            backgroundColor:
              offset >= disableNextAt
                ? colors.secondary_text
                : colors.button_bg,
            color:
              offset >= disableNextAt
                ? colors.border_color
                : colors.button_text,
            cursor: offset >= disableNextAt ? "not-allowed" : "pointer",
            opacity: offset >= disableNextAt ? 0.5 : 1,
          }}
          aria-label="Next"
        >
          &#8594;
        </button>
      </div>
    </>
  );
};

export default RangePeriodNavigator;
