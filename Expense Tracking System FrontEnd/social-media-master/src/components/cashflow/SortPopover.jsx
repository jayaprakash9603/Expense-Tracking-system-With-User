import React from "react";
import { createPortal } from "react-dom";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

// Reusable SortPopover component
// Props:
// open: boolean controlling visibility
// anchorRect: DOMRect of anchor element (computed outside) or null
// sortType: current sort selection
// onClose: function to close popover (used by parent outside click handler)
// onSelect: function(type) -> set selected sort type
// recentIcon: optional image src for recent icon
// styling overrides could be added later via className or style prop
const SortPopover = ({ open, anchorRect, sortType, onSelect, recentIcon }) => {
  if (!open || !anchorRect) return null;

  const top = anchorRect.top + window.scrollY;
  const left = anchorRect.right + 8 + window.scrollX;

  return createPortal(
    <div
      id="sort-popover"
      style={{
        position: "fixed",
        top,
        left,
        zIndex: 1000,
        background: "#0b0b0b",
        border: "1px solid #333",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
        minWidth: 140,
        maxWidth: 180,
        padding: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          padding: 4,
        }}
      >
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            background: sortType === "recent" ? "#5b7fff" : "transparent",
            color: sortType === "recent" ? "#fff" : "#5b7fff",
            border: "none",
            textAlign: "left",
            padding: "8px 12px",
            cursor: "pointer",
            fontWeight: sortType === "recent" ? 700 : 500,
            borderRadius: 6,
            transition: "background 0.2s, color 0.2s",
          }}
          onClick={() => onSelect("recent")}
        >
          {recentIcon && (
            <img
              src={recentIcon}
              alt="Recent"
              style={{
                width: 18,
                height: 18,
                filter:
                  sortType === "recent" ? "none" : "grayscale(1) brightness(2)",
                borderRadius: 3,
                background: "transparent",
                opacity: 1,
                ...(sortType === "recent"
                  ? {
                      filter:
                        "invert(1) sepia(1) saturate(5) hue-rotate(200deg)",
                    }
                  : {
                      filter:
                        "invert(34%) sepia(99%) saturate(749%) hue-rotate(200deg) brightness(1.2)",
                    }),
              }}
            />
          )}
          <span>Recent First</span>
        </button>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            background: sortType === "high" ? "#ff4d4f" : "transparent",
            color: sortType === "high" ? "#fff" : "#ff4d4f",
            border: "none",
            textAlign: "left",
            padding: "8px 12px",
            cursor: "pointer",
            fontWeight: sortType === "high" ? 700 : 500,
            borderRadius: 6,
            transition: "background 0.2s, color 0.2s",
          }}
          onClick={() => onSelect("high")}
        >
          <ArrowDownwardIcon
            fontSize="small"
            style={{ color: sortType === "high" ? "#fff" : "#ff4d4f" }}
          />
          <span>High to Low</span>
        </button>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            background: sortType === "low" ? "#06d6a0" : "transparent",
            color: sortType === "low" ? "#23243a" : "#06d6a0",
            border: "none",
            textAlign: "left",
            padding: "8px 12px",
            cursor: "pointer",
            fontWeight: sortType === "low" ? 700 : 500,
            borderRadius: 6,
            transition: "background 0.2s, color 0.2s",
          }}
          onClick={() => onSelect("low")}
        >
          <ArrowUpwardIcon
            fontSize="small"
            style={{ color: sortType === "low" ? "#23243a" : "#06d6a0" }}
          />
          <span>Low to High</span>
        </button>
      </div>
    </div>,
    document.body
  );
};

export default SortPopover;
