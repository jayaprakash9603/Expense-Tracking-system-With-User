const resolveOptionLabel = (options = [], value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const match = options.find(
    (option) => String(option.value) === String(value)
  );
  return match?.label ?? String(value);
};

const formatDateValue = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }
  return parsed.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const getSectionField = (section) => section?.field || section?.key;

export const buildActiveFilterSummary = (sections = [], values = {}) => {
  const items = [];

  sections.forEach((section) => {
    const field = getSectionField(section);
    if (!field) return;

    const value = values[field];
    const sectionType = section.type === "dateRange" ? "date-range" : section.type;

    if (sectionType === "radio" || sectionType === "select") {
      const label = resolveOptionLabel(section.options, value);
      if (label) {
        items.push({ id: section.id || field, label: section.label, value: label });
      }
      return;
    }

    if (sectionType === "checkbox-group") {
      if (Array.isArray(value) && value.length) {
        const labels = value
          .map((entry) => resolveOptionLabel(section.options, entry))
          .filter(Boolean);
        if (labels.length) {
          items.push({
            id: section.id || field,
            label: section.label,
            value: labels.join(", "),
          });
        }
      }
      return;
    }

    if (sectionType === "date-range") {
      const fromDate = value?.fromDate;
      const toDate = value?.toDate;
      if (fromDate && toDate) {
        items.push({
          id: section.id || field,
          label: section.label,
          value: `${formatDateValue(fromDate)} → ${formatDateValue(toDate)}`,
        });
      }
      return;
    }

    if (sectionType === "range") {
      const min = value?.min;
      const max = value?.max;
      if (min !== undefined && max !== undefined) {
        items.push({
          id: section.id || field,
          label: section.label,
          value: `${min} – ${max}`,
        });
      }
      return;
    }

    if (sectionType === "toggle" && value) {
      items.push({
        id: section.id || field,
        label: section.label,
        value: section.toggleLabel || "Enabled",
      });
    }
  });

  return items;
};

export const buildFilterFieldSx = (colors) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: colors.primary_bg,
    color: colors.primary_text,
    "& fieldset": {
      borderColor: colors.border_color,
    },
    "&:hover fieldset": {
      borderColor: colors.primary_accent,
    },
    "&.Mui-focused fieldset": {
      borderColor: colors.primary_accent,
      borderWidth: 1,
    },
  },
  "& .MuiInputLabel-root": {
    color: colors.secondary_text,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: colors.primary_accent,
  },
  "& .MuiOutlinedInput-input": {
    color: colors.primary_text,
  },
  "& .MuiSelect-icon": {
    color: colors.secondary_text,
  },
});

export const buildFilterDrawerScrollbarSx = (colors) => ({
  scrollbarGutter: "stable",
  scrollbarWidth: "thin",
  scrollbarColor: `${colors.primary_accent} transparent`,
  "&::-webkit-scrollbar": {
    width: 8,
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: `${colors.primary_accent}88`,
    borderRadius: 999,
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: colors.primary_accent,
  },
});
