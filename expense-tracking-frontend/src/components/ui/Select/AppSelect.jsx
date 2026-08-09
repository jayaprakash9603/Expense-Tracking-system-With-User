import React, { useId, useMemo, isValidElement } from "react";
import {
  Select as MuiSelect,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  ListSubheader,
  ListItemIcon,
  ListItemText,
  Chip,
  Box,
  useMediaQuery,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import PropTypes from "prop-types";
import { useTheme } from "../../../hooks/useTheme";
import "./AppSelect.css";

/**
 * AppSelect — theme-aware MUI Select for Expensio.
 *
 * Follows MUI Select a11y (labelId / aria-label) and supports:
 * - options API or MenuItem children
 * - icons + secondary text on options
 * - grouped options
 * - compact density for chart/toolbar headers
 * - native select on small screens when `preferNativeOnMobile`
 *
 * @example
 * <AppSelect
 *   label="Category"
 *   value={category}
 *   onChange={(e) => setCategory(e.target.value)}
 *   options={[
 *     { value: "food", label: "Food", icon: <RestaurantIcon /> },
 *     { value: "transport", label: "Transport" },
 *   ]}
 * />
 */
const AppSelect = React.forwardRef(
  (
    {
      value,
      onChange,
      onValueChange,
      options = [],
      groups,
      children,
      label,
      placeholder = "Select…",
      helperText = "",
      error = false,
      disabled = false,
      size = "medium",
      density = "comfortable",
      fullWidth = true,
      required = false,
      multiple = false,
      displayEmpty = true,
      renderValue,
      showSelectedCheck = true,
      startAdornment,
      preferNativeOnMobile = false,
      id: idProp,
      name,
      ariaLabel,
      className = "",
      sx = {},
      MenuProps: menuPropsOverride,
      FormControlProps = {},
      SelectProps = {},
      ...restProps
    },
    ref,
  ) => {
    const { colors, mode } = useTheme();
    const reactId = useId();
    const isMobile = useMediaQuery("(max-width:600px)");
    const useNative = Boolean(preferNativeOnMobile && isMobile && !multiple);

    const selectId = idProp || `app-select-${reactId}`;
    const labelId = label ? `${selectId}-label` : undefined;
    const helperId = helperText ? `${selectId}-helper` : undefined;

    const isCompact = density === "compact" || size === "compact";
    const resolvedSize = isCompact ? "small" : size === "large" ? "medium" : size;

    const sizeConfig = {
      compact: { height: 32, fontSize: 12, itemPy: 0.75, radius: 8 },
      small: { height: 40, fontSize: 14, itemPy: 1, radius: 10 },
      medium: { height: 48, fontSize: 15, itemPy: 1.25, radius: 10 },
      large: { height: 56, fontSize: 16, itemPy: 1.5, radius: 12 },
    };
    const currentSize =
      sizeConfig[isCompact ? "compact" : size] || sizeConfig.medium;

    const bgColor = colors.active_bg || colors.secondary_bg || "#29282b";
    const textColor = colors.primary_text || "#fff";
    const borderColor = colors.border_color || "rgb(75, 85, 99)";
    const focusBorderColor = colors.primary_accent || "#00dac6";
    const errorBorderColor = colors.error || "#ff4d4f";
    const placeholderColor =
      colors.placeholder_text || colors.secondary_text || "#9ca3af";
    const menuBg = colors.tertiary_bg || colors.primary_bg || "#1f1f23";

    const flatOptions = useMemo(() => {
      if (Array.isArray(groups) && groups.length > 0) {
        return groups.flatMap((g) => g.options || []);
      }
      return options;
    }, [groups, options]);

    const handleChange = (event) => {
      onChange?.(event);
      onValueChange?.(event?.target?.value);
    };

    const defaultRenderValue = (selected) => {
      if (
        selected === undefined ||
        selected === null ||
        selected === "" ||
        (Array.isArray(selected) && selected.length === 0)
      ) {
        return (
          <span className="app-select__placeholder" style={{ color: placeholderColor }}>
            {placeholder}
          </span>
        );
      }

      if (multiple && Array.isArray(selected)) {
        if (selected.length <= 2) {
          return selected
            .map((val) => {
              const option = flatOptions.find((opt) => opt.value === val);
              return option?.label || val;
            })
            .join(", ");
        }
        return (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selected.slice(0, 2).map((val) => {
              const option = flatOptions.find((opt) => opt.value === val);
              return (
                <Chip
                  key={String(val)}
                  size="small"
                  label={option?.label || val}
                  sx={{
                    height: 22,
                    fontSize: 11,
                    bgcolor: `${focusBorderColor}22`,
                    color: textColor,
                    border: `1px solid ${focusBorderColor}44`,
                  }}
                />
              );
            })}
            {selected.length > 2 ? (
              <Chip
                size="small"
                label={`+${selected.length - 2}`}
                sx={{
                  height: 22,
                  fontSize: 11,
                  bgcolor: colors.hover_bg,
                  color: textColor,
                }}
              />
            ) : null}
          </Box>
        );
      }

      const option = flatOptions.find((opt) => opt.value === selected);
      if (!option) return selected;

      return (
        <span className="app-select__value">
          {option.icon ? (
            <span className="app-select__value-icon" aria-hidden>
              {isValidElement(option.icon)
                ? React.cloneElement(option.icon, {
                    sx: {
                      fontSize: isCompact ? 14 : 18,
                      color: focusBorderColor,
                      ...(option.icon.props?.sx || {}),
                    },
                  })
                : option.icon}
            </span>
          ) : null}
          {option.label}
        </span>
      );
    };

    const formControlSx = {
      width: fullWidth ? "100%" : "auto",
      minWidth: isCompact ? 96 : undefined,
      "& .MuiInputBase-root": {
        backgroundColor: bgColor,
        color: textColor,
        minHeight: currentSize.height,
        height: multiple ? "auto" : currentSize.height,
        fontSize: currentSize.fontSize,
        borderRadius: `${currentSize.radius}px`,
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      },
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: error ? errorBorderColor : borderColor,
          borderWidth: error ? "2px" : "1px",
        },
        "&:hover fieldset": {
          borderColor: error ? errorBorderColor : focusBorderColor,
        },
        "&.Mui-focused fieldset": {
          borderColor: error ? errorBorderColor : focusBorderColor,
          borderWidth: "2px",
        },
        "&.Mui-focused": {
          boxShadow: error
            ? `0 0 0 3px ${errorBorderColor}22`
            : `0 0 0 3px ${focusBorderColor}22`,
        },
        "&.Mui-disabled": {
          opacity: 0.55,
        },
      },
      "& .MuiSelect-select": {
        display: "flex",
        alignItems: "center",
        py: isCompact ? "4px" : undefined,
        pr: "32px !important",
      },
      "& .MuiSelect-icon": {
        color: focusBorderColor,
        opacity: 0.9,
      },
      "& .MuiInputLabel-root": {
        color: colors.secondary_text || placeholderColor,
        "&.Mui-focused": {
          color: error ? errorBorderColor : focusBorderColor,
        },
        "&.Mui-error": {
          color: errorBorderColor,
        },
      },
      "& .MuiFormHelperText-root": {
        marginLeft: 0.5,
        fontSize: "0.75rem",
      },
      ...sx,
    };

    const menuProps = {
      PaperProps: {
        className: "app-select__menu-paper",
        sx: {
          mt: 0.75,
          backgroundColor: menuBg,
          color: textColor,
          borderRadius: "12px",
          border: `1px solid ${
            mode === "dark" ? `${focusBorderColor}40` : borderColor
          }`,
          boxShadow:
            mode === "dark"
              ? "0 16px 40px rgba(0,0,0,0.5)"
              : "0 12px 32px rgba(15,23,42,0.12)",
          backgroundImage: "none",
          maxHeight: 360,
          "& .MuiMenuItem-root": {
            fontSize: currentSize.fontSize,
            borderRadius: "8px",
            mx: 0.75,
            my: 0.25,
            py: currentSize.itemPy,
            minHeight: isCompact ? 36 : 44,
            gap: 1,
            transition: "background-color 0.15s ease, transform 0.15s ease",
            "&:hover": {
              backgroundColor: colors.hover_bg || "rgba(255,255,255,0.08)",
            },
            "&.Mui-selected": {
              backgroundColor: `${focusBorderColor}22`,
              color: textColor,
              fontWeight: 600,
              "&:hover": {
                backgroundColor: `${focusBorderColor}33`,
              },
            },
            "&.Mui-focusVisible": {
              backgroundColor: `${focusBorderColor}18`,
              outline: `2px solid ${focusBorderColor}`,
              outlineOffset: -2,
            },
          },
          "& .MuiListSubheader-root": {
            backgroundColor: menuBg,
            color: colors.secondary_text,
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            lineHeight: "32px",
          },
          ...(menuPropsOverride?.PaperProps?.sx || {}),
        },
        ...(menuPropsOverride?.PaperProps || {}),
      },
      ...menuPropsOverride,
    };

    const renderOptionContent = (option) => {
      const selected =
        multiple && Array.isArray(value)
          ? value.includes(option.value)
          : value === option.value;

      return (
        <>
          {option.icon ? (
            <ListItemIcon
              sx={{
                minWidth: 36,
                color: selected ? focusBorderColor : colors.secondary_text,
              }}
            >
              {isValidElement(option.icon)
                ? React.cloneElement(option.icon, {
                    sx: {
                      fontSize: 20,
                      color: selected ? focusBorderColor : colors.secondary_text,
                      ...(option.icon.props?.sx || {}),
                    },
                  })
                : option.icon}
            </ListItemIcon>
          ) : null}
          <ListItemText
            primary={option.label}
            secondary={option.description}
            primaryTypographyProps={{
              fontSize: currentSize.fontSize,
              fontWeight: selected ? 600 : 500,
              color: textColor,
            }}
            secondaryTypographyProps={{
              fontSize: "0.72rem",
              color: colors.secondary_text,
            }}
          />
          {showSelectedCheck && selected && !multiple ? (
            <CheckIcon sx={{ fontSize: 18, color: focusBorderColor, ml: 1 }} />
          ) : null}
        </>
      );
    };

    const renderOptions = () => {
      if (children) return children;

      if (Array.isArray(groups) && groups.length > 0) {
        return groups.flatMap((group) => [
          <ListSubheader key={`group-${group.label}`} disableSticky>
            {group.label}
          </ListSubheader>,
          ...(group.options || []).map((option) => (
            <MenuItem
              key={String(option.value)}
              value={option.value}
              disabled={option.disabled}
            >
              {renderOptionContent(option)}
            </MenuItem>
          )),
        ]);
      }

      return flatOptions.map((option) =>
        useNative ? (
          <option
            key={String(option.value)}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ) : (
          <MenuItem
            key={String(option.value)}
            value={option.value}
            disabled={option.disabled}
          >
            {renderOptionContent(option)}
          </MenuItem>
        ),
      );
    };

    return (
      <FormControl
        fullWidth={fullWidth}
        error={error}
        disabled={disabled}
        required={required}
        size={resolvedSize}
        className={`app-select${isCompact ? " app-select--compact" : ""} ${className}`.trim()}
        sx={formControlSx}
        {...FormControlProps}
      >
        {label && !useNative ? (
          <InputLabel id={labelId} htmlFor={selectId}>
            {label}
          </InputLabel>
        ) : null}
        {label && useNative ? (
          <InputLabel shrink htmlFor={selectId}>
            {label}
          </InputLabel>
        ) : null}

        <MuiSelect
          ref={ref}
          id={selectId}
          name={name}
          labelId={labelId}
          value={value ?? (multiple ? [] : "")}
          onChange={handleChange}
          label={label}
          multiple={multiple}
          native={useNative}
          displayEmpty={displayEmpty}
          renderValue={useNative ? undefined : renderValue || defaultRenderValue}
          startAdornment={startAdornment}
          MenuProps={useNative ? undefined : menuProps}
          inputProps={{
            "aria-label": !label ? ariaLabel || placeholder : undefined,
            "aria-describedby": helperId,
            ...(SelectProps.inputProps || {}),
          }}
          {...SelectProps}
          {...restProps}
        >
          {renderOptions()}
        </MuiSelect>

        {helperText ? (
          <FormHelperText id={helperId} role={error ? "alert" : undefined}>
            {helperText}
          </FormHelperText>
        ) : null}
      </FormControl>
    );
  },
);

AppSelect.displayName = "AppSelect";

const optionShape = PropTypes.shape({
  value: PropTypes.any.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  description: PropTypes.string,
  icon: PropTypes.node,
  disabled: PropTypes.bool,
});

AppSelect.propTypes = {
  value: PropTypes.any,
  onChange: PropTypes.func,
  onValueChange: PropTypes.func,
  options: PropTypes.arrayOf(optionShape),
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      options: PropTypes.arrayOf(optionShape).isRequired,
    }),
  ),
  children: PropTypes.node,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  helperText: PropTypes.string,
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(["compact", "small", "medium", "large"]),
  density: PropTypes.oneOf(["compact", "comfortable"]),
  fullWidth: PropTypes.bool,
  required: PropTypes.bool,
  multiple: PropTypes.bool,
  displayEmpty: PropTypes.bool,
  renderValue: PropTypes.func,
  showSelectedCheck: PropTypes.bool,
  startAdornment: PropTypes.node,
  preferNativeOnMobile: PropTypes.bool,
  id: PropTypes.string,
  name: PropTypes.string,
  ariaLabel: PropTypes.string,
  className: PropTypes.string,
  sx: PropTypes.object,
  MenuProps: PropTypes.object,
  FormControlProps: PropTypes.object,
  SelectProps: PropTypes.object,
};

export default AppSelect;
