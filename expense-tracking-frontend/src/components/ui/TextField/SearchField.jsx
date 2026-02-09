import React from "react";
import PropTypes from "prop-types";
import { InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AppTextField from "./AppTextField";
import { useTheme } from "../../../hooks/useTheme";

/**
 * SearchField - Semantic text field with search icon
 *
 * Use for search inputs throughout the application.
 *
 * @example
 * <SearchField
 *   value={searchQuery}
 *   onChange={(e) => setSearchQuery(e.target.value)}
 *   placeholder="Search expenses..."
 * />
 */
const SearchField = React.forwardRef(
  (
    {
      value,
      onChange,
      placeholder = "Search...",
      onClear,
      showClearButton = true,
      size = "small",
      ...props
    },
    ref,
  ) => {
    const { colors } = useTheme();

    return (
      <AppTextField
        ref={ref}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        size={size}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon
                sx={{
                  color: colors.secondary_text || "#9ca3af",
                  fontSize: size === "small" ? "20px" : "24px",
                }}
              />
            </InputAdornment>
          ),
        }}
        {...props}
      />
    );
  },
);

SearchField.displayName = "SearchField";

SearchField.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  onClear: PropTypes.func,
  showClearButton: PropTypes.bool,
  size: PropTypes.oneOf(["small", "medium", "large"]),
};

export default SearchField;
