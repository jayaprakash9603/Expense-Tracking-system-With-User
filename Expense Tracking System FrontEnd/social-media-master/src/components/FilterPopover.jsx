import React, { useEffect, useState } from "react";
import {
  Popover,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
  Box,
  Button,
} from "@mui/material";
import { useTheme } from "../hooks/useTheme";

/*
  Reusable FilterPopover
  Props:
    anchorEl: element for popover positioning
    open: boolean
    onClose: () => void
    title: string
    options: Array<{ value: string, label: string }>
  selected: string[] (committed / external)
  onApply: (newSelected: string[]) => void
  onClear?: () => void
*/
const FilterPopover = ({
  anchorEl,
  open,
  onClose,
  title = "Filters",
  options = [],
  selected = [],
  onApply,
  onClear,
}) => {
  const { colors } = useTheme();
  const [working, setWorking] = useState(selected);

  // Sync when popover opens with committed selection
  useEffect(() => {
    if (open) setWorking(selected);
  }, [open, selected]);

  const handleToggle = (value) => {
    setWorking((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleClear = () => {
    setWorking([]);
    onClear && onClear();
  };

  const handleDone = () => {
    onApply && onApply(working);
    onClose();
  };

  return (
    <Popover
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      PaperProps={{
        sx: {
          backgroundColor: colors.tertiary_bg,
          color: colors.primary_text,
          minWidth: 240,
          border: `1px solid ${colors.border_color}`,
          boxShadow: "0 4px 18px rgba(0,0,0,0.5)",
        },
      }}
    >
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            color: colors.primary_accent,
            mb: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {title}
          {working.length > 0 && (
            <span
              style={{
                background: colors.primary_accent,
                color: colors.secondary_bg,
                borderRadius: "999px",
                fontSize: 10,
                fontWeight: 600,
                padding: "2px 6px",
                lineHeight: 1,
              }}
            >
              {working.length}
            </span>
          )}
        </Typography>
        {/* Removed chip display per user request */}
        <FormGroup
          sx={{ maxHeight: 200, overflowY: "auto", pr: 1 }}
          className="custom-scrollbar"
        >
          {options.map((opt) => (
            <FormControlLabel
              key={opt.value}
              control={
                <Checkbox
                  size="small"
                  checked={working.includes(opt.value)}
                  onChange={() => handleToggle(opt.value)}
                  sx={{
                    color: colors.icon_muted,
                    "&.Mui-checked": { color: colors.primary_accent },
                  }}
                />
              }
              label={<span style={{ fontSize: 13 }}>{opt.label}</span>}
              sx={{
                m: 0,
                alignItems: "center",
                "& .MuiFormControlLabel-label": { color: colors.primary_text },
              }}
            />
          ))}
        </FormGroup>
        <Divider sx={{ my: 1, borderColor: colors.border_color }} />
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleClear}
            disabled={working.length === 0 && selected.length === 0}
            sx={{
              borderColor:
                working.length === 0 && selected.length === 0
                  ? colors.border_color
                  : "#e6a935",
              color:
                working.length === 0 && selected.length === 0
                  ? colors.secondary_text
                  : "#e6a935",
              backgroundColor:
                working.length === 0 && selected.length === 0
                  ? "transparent"
                  : "rgba(230,169,53,0.08)",
              fontWeight: 600,
              letterSpacing: 0.3,
              "&:hover": {
                borderColor:
                  working.length === 0 && selected.length === 0
                    ? colors.hover_bg
                    : "#f0b949",
                backgroundColor:
                  working.length === 0 && selected.length === 0
                    ? colors.hover_bg
                    : "rgba(230,169,53,0.15)",
              },
              transition: "all 0.18s ease",
            }}
          >
            Clear
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleDone}
            sx={{
              backgroundColor: colors.primary_accent,
              "&:hover": { backgroundColor: colors.button_hover },
            }}
          >
            Done
          </Button>
        </Box>
      </Box>
    </Popover>
  );
};

export default FilterPopover;
