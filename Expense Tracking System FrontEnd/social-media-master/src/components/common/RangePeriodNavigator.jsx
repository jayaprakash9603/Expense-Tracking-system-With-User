import React from "react";
import { Button } from "@mui/material";

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
              backgroundColor: "#1b1b1b",
              borderRadius: "8px",
              color: "#00DAC6",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              px: 1.5,
              py: 0.75,
              textTransform: "none",
              fontSize: isMobile ? "0.7rem" : "0.8rem",
              minHeight: 36,
              "&:hover": { backgroundColor: "#28282a" },
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
                stroke="#00DAC6"
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
              className={`px-4 py-2 rounded font-semibold flex items-center gap-2 ${
                activeRange === tab.value
                  ? "bg-[#00DAC6] text-black"
                  : "bg-[#29282b] text-white"
              }`}
              style={{ transition: "background-color 0.2s" }}
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
          className={`px-3 py-1 rounded text-lg flex items-center ${
            offset <= disablePrevAt
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-[#00DAC6] text-black hover:bg-[#00b8a0]"
          }`}
          aria-label="Previous"
        >
          &#8592;
        </button>
        <span className="text-white text-sm">{rangeLabel}</span>
        <button
          onClick={handleNext}
          disabled={offset >= disableNextAt}
          className={`px-3 py-1 rounded text-lg flex items-center ${
            offset >= disableNextAt
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-[#00DAC6] text-black hover:bg-[#00b8a0]"
          }`}
          aria-label="Next"
        >
          &#8594;
        </button>
      </div>
    </>
  );
};

export default RangePeriodNavigator;
