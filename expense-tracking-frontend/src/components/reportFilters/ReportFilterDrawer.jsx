import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Drawer,
  Box,
  Typography,
  Divider,
  Button,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
  TextField,
  Stack,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "../../hooks/useTheme";
import {
  buildActiveFilterSummary,
  buildFilterDrawerScrollbarSx,
  buildFilterFieldSx,
  getSectionField,
} from "./reportFilterDrawerUtils";

const SectionContainer = ({ children, first = false, colors }) => (
  <Box
    sx={{
      mt: first ? 0 : 2.5,
      p: 2,
      borderRadius: "12px",
      border: `1px solid ${colors.border_color}`,
      backgroundColor:
        colors.tertiary_bg || colors.secondary_bg || colors.primary_bg,
    }}
  >
    {children}
  </Box>
);

const SectionLabel = ({ text, helperText, colors }) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography
      variant="subtitle2"
      sx={{ fontWeight: 700, color: colors.primary_text, fontSize: "0.9rem" }}
    >
      {text}
    </Typography>
    {helperText ? (
      <Typography
        variant="caption"
        sx={{ color: colors.secondary_text, display: "block", mt: 0.5 }}
      >
        {helperText}
      </Typography>
    ) : null}
  </Box>
);

const normalizeRangeValue = (value, fallback = {}) => {
  if (!value || typeof value !== "object") {
    return { min: fallback.min ?? 0, max: fallback.max ?? 0 };
  }
  return {
    min: value.min ?? fallback.min ?? 0,
    max: value.max ?? fallback.max ?? 0,
  };
};

const normalizeDateRange = (value = { fromDate: "", toDate: "" }) => ({
  fromDate: value.fromDate || "",
  toDate: value.toDate || "",
});

const normalizeSections = (sections = []) =>
  sections
    .filter(Boolean)
    .map((section) => ({
      ...section,
      field: getSectionField(section),
      type: section.type === "dateRange" ? "date-range" : section.type,
    }))
    .filter((section) => section.field);

const ReportFilterDrawer = ({
  open,
  onClose,
  sections = [],
  values = {},
  initialValues = {},
  onApply,
  onReset,
  title = "Filters",
  subtitle = "Refine the analytics to spotlight what matters.",
  width = 380,
  anchor = "left",
}) => {
  const { colors, mode } = useTheme();
  const [localValues, setLocalValues] = useState(values || {});

  const normalizedSections = useMemo(
    () => normalizeSections(sections),
    [sections]
  );

  useEffect(() => {
    if (open) {
      setLocalValues(values || {});
    }
  }, [open, values]);

  const brandBg = colors.secondary_accent || colors.primary_accent || "#00DAC6";
  const brandText = mode === "dark" ? "#0f172a" : "#ffffff";
  const fieldSx = useMemo(() => buildFilterFieldSx(colors), [colors]);
  const scrollSx = useMemo(
    () => buildFilterDrawerScrollbarSx(colors),
    [colors]
  );

  const handleFieldChange = useCallback((field, next) => {
    setLocalValues((prev) => ({
      ...prev,
      [field]: next,
    }));
  }, []);

  const toggleArrayValue = useCallback((field, optionValue) => {
    setLocalValues((prev) => {
      const current = Array.isArray(prev[field]) ? prev[field] : [];
      const exists = current.includes(optionValue);
      const next = exists
        ? current.filter((entry) => entry !== optionValue)
        : [...current, optionValue];
      return {
        ...prev,
        [field]: next,
      };
    });
  }, []);

  const controlAccentSx = {
    color: colors.secondary_text,
    "&.Mui-checked": { color: brandBg },
  };

  const optionRowSx = (selected) => ({
    mx: 0,
    px: 1,
    py: 0.25,
    minHeight: 44,
    borderRadius: "8px",
    transition: "background-color 0.15s ease",
    backgroundColor: selected ? `${brandBg}14` : "transparent",
    "&:hover": {
      backgroundColor: colors.hover_bg,
    },
    "& .MuiFormControlLabel-label": {
      fontSize: "0.875rem",
      fontWeight: selected ? 600 : 500,
      color: colors.primary_text,
    },
  });

  const renderCheckboxGroup = (section) => {
    const current = Array.isArray(localValues[section.field])
      ? localValues[section.field]
      : [];
    return (
      <Stack spacing={0.25}>
        {section.options.map((option) => {
          const checked = current.includes(option.value);
          return (
            <FormControlLabel
              key={`${section.id}-${option.value}`}
              sx={optionRowSx(checked)}
              control={
                <Checkbox
                  checked={checked}
                  onChange={() => toggleArrayValue(section.field, option.value)}
                  sx={controlAccentSx}
                />
              }
              label={option.label}
            />
          );
        })}
      </Stack>
    );
  };

  const renderRadioGroup = (section) => {
    const current = localValues[section.field] ?? "";
    return (
      <RadioGroup
        value={current}
        onChange={(event) =>
          handleFieldChange(section.field, event.target.value)
        }
      >
        {section.options.map((option) => {
          const selected = String(current) === String(option.value);
          return (
            <FormControlLabel
              key={`${section.id}-${option.value}`}
              value={option.value}
              sx={optionRowSx(selected)}
              control={<Radio sx={controlAccentSx} />}
              label={option.label}
            />
          );
        })}
      </RadioGroup>
    );
  };

  const renderSelect = (section) => {
    const current = localValues[section.field] ?? "";
    return (
      <FormControl fullWidth size="small" sx={fieldSx}>
        <InputLabel id={`${section.id}-label`}>{section.label}</InputLabel>
        <Select
          labelId={`${section.id}-label`}
          value={current}
          label={section.label}
          onChange={(event) =>
            handleFieldChange(section.field, event.target.value)
          }
        >
          {section.options.map((option) => (
            <MenuItem key={`${section.id}-${option.value}`} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  const renderRange = (section) => {
    const defaults = { min: section.min ?? 0, max: section.max ?? 0 };
    const current = normalizeRangeValue(localValues[section.field], defaults);
    return (
      <Stack direction="row" spacing={1.5} alignItems="center">
        <TextField
          label="Min"
          type="number"
          value={current.min}
          onChange={(event) =>
            handleFieldChange(section.field, {
              ...current,
              min: Number(event.target.value),
            })
          }
          size="small"
          fullWidth
          sx={fieldSx}
          inputProps={{ min: section.min }}
        />
        <TextField
          label="Max"
          type="number"
          value={current.max}
          onChange={(event) =>
            handleFieldChange(section.field, {
              ...current,
              max: Number(event.target.value),
            })
          }
          size="small"
          fullWidth
          sx={fieldSx}
          inputProps={{ min: current.min, max: section.max }}
        />
      </Stack>
    );
  };

  const renderToggle = (section) => {
    const current = Boolean(localValues[section.field]);
    return (
      <FormControlLabel
        sx={optionRowSx(current)}
        control={
          <Switch
            checked={current}
            onChange={(event) =>
              handleFieldChange(section.field, event.target.checked)
            }
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: brandBg,
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: brandBg,
              },
            }}
          />
        }
        label={section.toggleLabel || "Enabled"}
      />
    );
  };

  const renderDateRange = (section) => {
    const current = normalizeDateRange(localValues[section.field]);
    return (
      <Stack spacing={1.5}>
        <TextField
          label="From"
          type="date"
          value={current.fromDate}
          onChange={(event) =>
            handleFieldChange(section.field, {
              ...current,
              fromDate: event.target.value,
            })
          }
          size="small"
          fullWidth
          sx={fieldSx}
          InputLabelProps={{ shrink: true }}
          inputProps={{
            min: section.minDate || undefined,
            max: current.toDate || section.maxDate || undefined,
          }}
        />
        <TextField
          label="To"
          type="date"
          value={current.toDate}
          onChange={(event) =>
            handleFieldChange(section.field, {
              ...current,
              toDate: event.target.value,
            })
          }
          size="small"
          fullWidth
          sx={fieldSx}
          InputLabelProps={{ shrink: true }}
          inputProps={{
            min: current.fromDate || section.minDate || undefined,
            max: section.maxDate || undefined,
          }}
        />
      </Stack>
    );
  };

  const renderCustom = (section) => {
    if (typeof section.render !== "function") {
      return null;
    }
    return section.render({
      value: localValues[section.field],
      onChange: (next) => handleFieldChange(section.field, next),
      colors,
      fieldSx,
    });
  };

  const renderSectionControl = (section) => {
    switch (section.type) {
      case "checkbox-group":
        return renderCheckboxGroup(section);
      case "radio":
        return renderRadioGroup(section);
      case "select":
        return renderSelect(section);
      case "range":
        return renderRange(section);
      case "toggle":
        return renderToggle(section);
      case "date-range":
        return renderDateRange(section);
      case "custom":
        return renderCustom(section);
      default:
        return null;
    }
  };

  const handleApply = () => {
    if (typeof onApply === "function") {
      onApply(localValues);
    }
  };

  const handleReset = () => {
    const fallback =
      (typeof onReset === "function" && onReset()) || initialValues || {};
    setLocalValues(fallback);
  };

  const summaryItems = useMemo(
    () => buildActiveFilterSummary(normalizedSections, localValues),
    [normalizedSections, localValues]
  );

  const hasSections = normalizedSections.length > 0;

  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
      }}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: width },
          maxWidth: "100vw",
          backgroundColor: colors.secondary_bg || colors.primary_bg,
          color: colors.primary_text,
          borderLeft:
            anchor === "right"
              ? `1px solid ${colors.border_color}`
              : undefined,
          borderRight:
            anchor === "left"
              ? `1px solid ${colors.border_color}`
              : undefined,
          boxShadow:
            mode === "dark"
              ? "0 0 48px rgba(0, 0, 0, 0.55)"
              : "0 0 48px rgba(15, 23, 42, 0.14)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            px: 2.5,
            pt: 2.5,
            pb: 2,
            gap: 1,
          }}
        >
          <Box sx={{ minWidth: 0, pr: 1 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, fontSize: "1.125rem", lineHeight: 1.3 }}
            >
              {title}
            </Typography>
            {subtitle ? (
              <Typography
                variant="body2"
                sx={{ color: colors.secondary_text, mt: 0.5, lineHeight: 1.5 }}
              >
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          <IconButton
            onClick={onClose}
            aria-label="Close filters"
            sx={{
              color: colors.secondary_text,
              border: `1px solid ${colors.border_color}`,
              borderRadius: "10px",
              width: 36,
              height: 36,
              "&:hover": {
                color: colors.primary_text,
                backgroundColor: colors.hover_bg,
                borderColor: colors.primary_accent,
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: colors.border_color }} />

        <Box
          sx={{
            px: 2.5,
            py: 2,
            flex: 1,
            overflowY: "auto",
            ...scrollSx,
          }}
        >
          {hasSections ? (
            normalizedSections.map((section, index) => (
              <SectionContainer
                key={section.id || section.field}
                first={index === 0}
                colors={colors}
              >
                {section.type === "select" ? (
                  section.helperText ? (
                    <SectionLabel
                      text=""
                      helperText={section.helperText}
                      colors={colors}
                    />
                  ) : null
                ) : section.label ? (
                  <SectionLabel
                    text={section.label}
                    helperText={section.helperText}
                    colors={colors}
                  />
                ) : null}
                {renderSectionControl(section)}
              </SectionContainer>
            ))
          ) : (
            <Typography variant="body2" sx={{ color: colors.secondary_text }}>
              No filters available for this report.
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            borderTop: `1px solid ${colors.border_color}`,
            backgroundColor: colors.primary_bg,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: colors.secondary_text,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              fontSize: "0.68rem",
            }}
          >
            Active Selections
          </Typography>
          {summaryItems.length ? (
            <Box
              component="ul"
              sx={{
                listStyle: "disc",
                pl: 2.5,
                mt: 0.75,
                mb: 0,
                maxHeight: 120,
                overflowY: "auto",
                ...scrollSx,
              }}
            >
              {summaryItems.map((item) => (
                <Box
                  component="li"
                  key={item.id}
                  sx={{
                    fontSize: "0.8125rem",
                    color: colors.primary_text,
                    mb: 0.25,
                    lineHeight: 1.45,
                  }}
                >
                  <Box component="span" sx={{ color: colors.secondary_text }}>
                    {item.label}:
                  </Box>{" "}
                  {item.value}
                </Box>
              ))}
            </Box>
          ) : (
            <Typography
              variant="body2"
              sx={{ color: colors.secondary_text, mt: 0.75, mb: 0 }}
            >
              No filters selected yet.
            </Typography>
          )}
        </Box>

        <Divider sx={{ borderColor: colors.border_color }} />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2.5,
            py: 2,
            backgroundColor: colors.primary_bg,
          }}
        >
          <Button
            variant="text"
            onClick={handleReset}
            sx={{
              color: colors.primary_text,
              fontWeight: 700,
              letterSpacing: "0.06em",
              minWidth: 88,
            }}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            onClick={handleApply}
            fullWidth
            sx={{
              minHeight: 44,
              borderRadius: "10px",
              fontWeight: 700,
              letterSpacing: "0.03em",
              backgroundColor: brandBg,
              color: brandText,
              boxShadow: "none",
              "&:hover": {
                backgroundColor: brandBg,
                opacity: 0.92,
                boxShadow: "none",
              },
            }}
          >
            Apply Filters
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ReportFilterDrawer;
