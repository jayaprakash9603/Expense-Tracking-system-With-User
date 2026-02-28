import React from "react";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import { AppAutocomplete } from "../ui";

export default function AccordionToolbar({
  showGroupSearch,
  groupSearch,
  groupSearchOptions,
  onGroupSearchChange,
  showGroupSort,
  groupSort,
  onGroupSortChange,
  showClearSelection,
  onClearSelection,
  // New props for Select All functionality
  showSelectAll = false,
  isAllSelected = false,
  isSomeSelected = false,
  onSelectAll,
  totalItemsCount = 0,
  selectedCount = 0,
}) {
  if (
    !showGroupSearch &&
    !showGroupSort &&
    !showClearSelection &&
    !showSelectAll
  )
    return null;

  return (
    <div className="pm-accordion-toolbar">
      <div className="pm-toolbar-left">
        {showSelectAll ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginRight: "16px",
              padding: "4px 8px",
              borderRadius: "8px",
              background: "var(--pm-bg-secondary, rgba(255,255,255,0.05))",
            }}
          >
            <Checkbox
              checked={isAllSelected}
              indeterminate={isSomeSelected && !isAllSelected}
              onChange={(e) => onSelectAll?.(e.target.checked)}
              size="small"
              sx={{
                padding: "4px",
                color: "var(--pm-text-secondary, #888)",
                "&.Mui-checked": {
                  color: "var(--pm-accent-color, #14b8a6)",
                },
                "&.MuiCheckbox-indeterminate": {
                  color: "var(--pm-accent-color, #14b8a6)",
                },
              }}
            />
            <span
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--pm-text-primary, #fff)",
                whiteSpace: "nowrap",
              }}
            >
              {selectedCount > 0
                ? `${selectedCount} of ${totalItemsCount}`
                : "Select All"}
            </span>
          </div>
        ) : null}
        {showGroupSearch ? (
          <AppAutocomplete
            options={
              Array.isArray(groupSearchOptions) ? groupSearchOptions : []
            }
            value={groupSearch || ""}
            onInputChange={(event, value) => onGroupSearchChange?.(value)}
            onChange={(event, newValue) =>
              onGroupSearchChange?.(newValue || "")
            }
            getOptionLabel={(option) => String(option || "")}
            isOptionEqualToValue={(option, value) =>
              String(option || "") === String(value || "")
            }
            placeholder="Search groups…"
            size="small"
            freeSolo
            clearOnBlur={false}
            disableClearable={false}
            sx={{
              flex: "1 1 420px",
              width: "100%",
              minWidth: "260px",
              maxWidth: "520px",
              "& .MuiInputBase-root": {
                height: "36px",
                fontSize: "13px",
                borderRadius: "10px",
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderRadius: "10px" },
              },
            }}
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
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}
