import React, { useState, useEffect } from "react";
import {
  Popover,
  Box,
  Typography,
  Select,
  MenuItem,
  TextField,
  Button,
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "../../hooks/useTheme";

const OPERATORS = [
  { value: "contains", label: "Contains" },
  { value: "equals", label: "Equals" },
  { value: "startsWith", label: "Starts with" },
  { value: "endsWith", label: "Ends with" },
  { value: "gt", label: "Greater than (>)" },
  { value: "lt", label: "Less than (<)" },
  { value: "neq", label: "Not equal" },
];

export default function FilterPopover({
  open,
  anchorEl,
  column,
  initialOperator = "contains",
  initialValue = "",
  onClose,
  onApply,
  onClear,
}) {
  const { colors, mode } = useTheme();
  const [operator, setOperator] = useState(initialOperator);
  const [value, setValue] = useState(initialValue);

  // Reset state when popover opens with new props
  useEffect(() => {
    if (open) {
      setOperator(initialOperator || "contains");
      setValue(initialValue || "");
    }
  }, [open, initialOperator, initialValue]);

  const handleApply = () => {
    onApply({ operator, value });
    onClose();
  };

  const handleClear = () => {
    setValue("");
    setOperator("contains");
    onClear();
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      PaperProps={{
        sx: {
          p: 2,
          width: 320,
          backgroundColor: colors.secondary_bg,
          color: colors.primary_text,
          border: `1px solid ${colors.border_color}`,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Filter by {column?.label}
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: colors.icon_muted }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel sx={{ color: colors.secondary_text }}>Operator</InputLabel>
        <Select
          value={operator}
          label="Operator"
          onChange={(e) => setOperator(e.target.value)}
          sx={{
            color: colors.primary_text,
            ".MuiOutlinedInput-notchedOutline": {
              borderColor: colors.border_color,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: colors.primary_accent,
            },
            ".MuiSvgIcon-root": { color: colors.icon_muted },
          }}
        >
          {OPERATORS.map((op) => (
            <MenuItem key={op.value} value={op.value}>
              {op.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        size="small"
        placeholder="Filter value..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        sx={{
          mb: 2,
          input: { color: colors.primary_text },
          ".MuiOutlinedInput-notchedOutline": {
            borderColor: colors.border_color,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.primary_accent,
          },
        }}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={handleClear}
          sx={{
            color: colors.primary_text,
            borderColor: colors.border_color,
            "&:hover": { borderColor: colors.primary_text },
          }}
        >
          Clear
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={handleApply}
          sx={{
            backgroundColor: colors.primary_accent,
            color: "#fff",
            "&:hover": {
              backgroundColor: colors.secondary_accent || colors.primary_accent,
            },
          }}
        >
          Apply
        </Button>
      </Box>
    </Popover>
  );
}
