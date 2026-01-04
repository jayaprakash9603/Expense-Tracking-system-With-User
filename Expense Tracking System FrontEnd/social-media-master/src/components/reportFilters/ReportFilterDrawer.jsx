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
} from "@mui/material";
import { X } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

const SectionContainer = ({ children, first = false }) => (
  <Box sx={{ mt: first ? 0 : 3 }}>{children}</Box>
);

const SectionLabel = ({ text, helperText }) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
      {text}
    </Typography>
    {helperText ? (
      <Typography variant="caption" sx={{ opacity: 0.8 }}>
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

const ReportFilterDrawer = ({
  open,
  onClose,
  sections = [],
  values = {},
  initialValues = {},
  onApply,
  onReset,
  title = "Filters",
  subtitle = "Refine the analytics to spotlight what matters",
  width = 360,
}) => {
  const { colors, mode } = useTheme();
  const [localValues, setLocalValues] = useState(values || {});

  useEffect(() => {
    if (open) {
      setLocalValues(values || {});
    }
  }, [open, values]);

  const brandBg = colors.secondary_accent || "#00DAC6";
  const brandText = mode === "dark" ? "#0f0f0f" : colors.primary_text;

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

  const renderCheckboxGroup = (section) => {
    const current = Array.isArray(localValues[section.field])
      ? localValues[section.field]
      : [];
    return (
      <Stack spacing={0.5}>
        {section.options.map((option) => (
          <FormControlLabel
            key={`${section.id}-${option.value}`}
            control={
              <Checkbox
                checked={current.includes(option.value)}
                onChange={() => toggleArrayValue(section.field, option.value)}
                sx={{
                  color: colors.secondary_text,
                  "&.Mui-checked": { color: brandBg },
                }}
              />
            }
            label={option.label}
          />
        ))}
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
        {section.options.map((option) => (
          <FormControlLabel
            key={`${section.id}-${option.value}`}
            value={option.value}
            control={
              <Radio
                sx={{
                  color: colors.secondary_text,
                  "&.Mui-checked": { color: brandBg },
                }}
              />
            }
            label={option.label}
          />
        ))}
      </RadioGroup>
    );
  };

  const renderRange = (section) => {
    const defaults = { min: section.min ?? 0, max: section.max ?? 0 };
    const current = normalizeRangeValue(localValues[section.field], defaults);
    return (
      <Stack direction="row" spacing={2} alignItems="center">
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
          inputProps={{ min: current.min, max: section.max }}
        />
      </Stack>
    );
  };

  const renderToggle = (section) => {
    const current = Boolean(localValues[section.field]);
    return (
      <FormControlLabel
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
          InputLabelProps={{ shrink: true }}
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
          InputLabelProps={{ shrink: true }}
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
    });
  };

  const renderSectionControl = (section) => {
    switch (section.type) {
      case "checkbox-group":
        return renderCheckboxGroup(section);
      case "radio":
        return renderRadioGroup(section);
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

  const hasSections = Array.isArray(sections) && sections.length > 0;

  const summaryTags = useMemo(() => {
    const tags = [];
    sections.forEach((section) => {
      const value = localValues[section.field];
      if (section.type === "checkbox-group" && Array.isArray(value)) {
        value.forEach((entry) =>
          tags.push(`${section.label}: ${String(entry)}`)
        );
      }
      if (section.type === "radio" && value) {
        tags.push(`${section.label}: ${value}`);
      }
    });
    return tags;
  }, [sections, localValues]);

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: width },
          backgroundColor: colors.primary_bg,
          color: colors.primary_text,
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
            alignItems: "center",
            justifyContent: "space-between",
            p: 3,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {subtitle ? (
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          <Button
            onClick={onClose}
            sx={{
              minWidth: 0,
              color: colors.secondary_text,
              borderRadius: "50%",
              p: 1,
            }}
          >
            <X size={18} />
          </Button>
        </Box>
        <Divider sx={{ borderColor: colors.border_color }} />
        <Box sx={{ p: 3, pt: 2, flex: 1, overflowY: "auto" }}>
          {hasSections ? (
            sections.map((section, index) => (
              <SectionContainer
                key={section.id || section.field}
                first={index === 0}
              >
                {section.label ? (
                  <SectionLabel
                    text={section.label}
                    helperText={section.helperText}
                  />
                ) : null}
                {renderSectionControl(section)}
              </SectionContainer>
            ))
          ) : (
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              No filters available for this report.
            </Typography>
          )}
        </Box>
        {summaryTags.length ? (
          <Box sx={{ px: 3, pb: 1 }}>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Active Selections:
            </Typography>
            <Box
              component="ul"
              sx={{
                listStyle: "disc",
                pl: 3,
                mt: 0.5,
                mb: 0,
                maxHeight: 96,
                overflowY: "auto",
              }}
            >
              {summaryTags.map((tag, index) => (
                <li key={`${tag}-${index}`} style={{ fontSize: "0.75rem" }}>
                  {tag}
                </li>
              ))}
            </Box>
          </Box>
        ) : null}
        <Divider sx={{ borderColor: colors.border_color }} />
        <Box
          sx={{
            display: "flex",
            gap: 1,
            p: 3,
            pt: 2,
            borderTop: `1px solid ${colors.border_color}`,
          }}
        >
          <Button
            variant="text"
            onClick={handleReset}
            sx={{ color: colors.secondary_text, flex: 1 }}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            onClick={handleApply}
            sx={{
              flex: 2,
              backgroundColor: brandBg,
              color: brandText,
              "&:hover": {
                backgroundColor: brandBg,
                opacity: 0.9,
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
