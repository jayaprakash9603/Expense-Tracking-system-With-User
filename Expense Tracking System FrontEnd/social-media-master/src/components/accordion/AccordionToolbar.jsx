import React from "react";
import Button from "@mui/material/Button";
import ReusableAutocomplete from "../ReusableAutocomplete";

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
}) {
  if (!showGroupSearch && !showGroupSort && !showClearSelection) return null;

  return (
    <div className="pm-accordion-toolbar">
      <div className="pm-toolbar-left">
        {showGroupSearch ? (
          <ReusableAutocomplete
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
