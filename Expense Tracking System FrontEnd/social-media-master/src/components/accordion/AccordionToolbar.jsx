import React from "react";
import Button from "@mui/material/Button";

export default function AccordionToolbar({
  showGroupSearch,
  groupSearch,
  onGroupSearchChange,
  showGroupSort,
  groupSort,
  onGroupSortChange,
  showClearSelection,
  onClearSelection,
}) {
  if (!showGroupSearch && !showGroupSort && !showClearSelection) return null;

  return (
    <div className="pm-accordion-toolbar">
      <div className="pm-toolbar-left">
        {showGroupSearch ? (
          <input
            className="pm-search-input"
            value={groupSearch || ""}
            onChange={(e) => onGroupSearchChange?.(e.target.value)}
            placeholder="Search groups…"
            aria-label="Search accordion groups"
          />
        ) : null}
      </div>

      <div className="pm-toolbar-right">
        {showGroupSort ? (
          <>
            <label className="pm-toolbar-label">
              <span>Sort groups:</span>
              <select
                value={groupSort?.key || "default"}
                onChange={(e) =>
                  onGroupSortChange?.({
                    ...(groupSort || { direction: "desc" }),
                    key: e.target.value,
                  })
                }
                aria-label="Sort groups by"
              >
                <option value="default">Default</option>
                <option value="amount">Amount</option>
                <option value="count">Count</option>
                <option value="name">Name</option>
              </select>
            </label>

            <label className="pm-toolbar-label">
              <span>Dir:</span>
              <select
                value={groupSort?.direction || "desc"}
                onChange={(e) =>
                  onGroupSortChange?.({
                    ...(groupSort || { key: "default" }),
                    direction: e.target.value,
                  })
                }
                aria-label="Group sort direction"
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </label>
          </>
        ) : null}

        {showClearSelection ? (
          <Button
            variant="contained"
            color="error"
            size="small"
            disableElevation
            onClick={() => onClearSelection?.()}
            sx={{
              height: "36px",
              borderRadius: "10px",
              padding: "0 12px",
              minWidth: "auto",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "12px",
              "&:hover": {
                opacity: 0.92,
              },
            }}
          >
            Clear selection
          </Button>
        ) : null}
      </div>
    </div>
  );
}
