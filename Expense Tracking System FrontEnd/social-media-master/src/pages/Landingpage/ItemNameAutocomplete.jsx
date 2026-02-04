import React, { useState, useEffect } from "react";
import itemService from "../../services/itemService";
import { useTheme } from "../../hooks/useTheme";
import ReusableAutocomplete from "../../components/ReusableAutocomplete";
import HighlightedText from "../../components/common/HighlightedText";

const ItemNameAutocomplete = ({
  value = "",
  onChange,
  placeholder = "Item name",
  disabled = false,
  error = false,
  autoFocus = false,
  sx = {},
  ...otherProps
}) => {
  const { colors } = useTheme();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  // Update input value when value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Load initial items from service (service may use local dummy list or API)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const items = await itemService.getAllItems();
        if (!mounted) return;
        setOptions(items || []);
      } catch (err) {
        console.error("Failed to load items from service", err);
        setOptions([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Future API integration function
  const fetchItemNames = async (searchTerm = "") => {
    setLoading(true);
    try {
      if (!searchTerm) {
        const items = await itemService.getAllItems();
        setOptions(items || []);
        return;
      }
      const filtered = await itemService.searchItems(searchTerm);
      setOptions(filtered || []);
    } catch (error) {
      console.error("Error fetching item names:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change with debouncing for future API calls
  const handleInputChange = (event, newInputValue, reason) => {
    setInputValue(newInputValue);
    fetchItemNames(newInputValue);
  };

  // Handle selection change
  const handleChange = (event, newValue) => {
    // Update local state immediately
    const finalValue = typeof newValue === "string" ? newValue : newValue || "";
    setInputValue(finalValue);

    if (onChange) {
      // Call the parent's onChange handler
      onChange(event, finalValue);
    }
  };

  // Custom render option with highlighting
  const renderOption = (props, option, { inputValue }) => {
    const { key, ...optionProps } = props;
    return (
      <li
        key={key}
        {...optionProps}
        style={{
          fontSize: "13px",
          padding: "6px 10px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: 300,
        }}
        title={option}
      >
        <HighlightedText
          text={option}
          query={inputValue}
          title={option}
          highlightStyle={{ color: colors.secondary_accent, fontWeight: 700 }}
        />
      </li>
    );
  };

  return (
    <ReusableAutocomplete
      options={options}
      value={value}
      onChange={handleChange}
      onInputChange={handleInputChange}
      getOptionLabel={(option) => option || ""}
      placeholder={placeholder}
      error={error}
      disabled={disabled}
      loading={loading}
      loadingText="Loading"
      noOptionsText={inputValue ? "No Data Found" : ""}
      size="small"
      autoHighlight={true}
      autoFocus={autoFocus}
      clearOnBlur={false}
      freeSolo={true}
      renderOption={renderOption}
      backgroundColor={colors.primary_bg}
      textColor={colors.primary_text}
      borderColor={colors.border_color}
      focusBorderColor={colors.secondary_accent}
      placeholderColor={colors.icon_muted}
      sx={{
        width: "100%",
        maxWidth: "300px",
        "& .MuiInputBase-root": {
          height: "37px !important",
          minHeight: "37px !important",
          fontSize: "14px !important",
          backgroundColor: `${colors.primary_bg} !important`,
        },
        "& .MuiInputBase-input": {
          padding: "4px 8px !important",
          height: "24px !important",
          fontSize: "14px !important",
          color: `${colors.primary_text} !important`,
          backgroundColor: `${colors.primary_bg} !important`,
        },
        "& .MuiAutocomplete-listbox": {
          backgroundColor: `${colors.primary_bg} !important`,
          color: `${colors.primary_text} !important`,
          padding: "4px 0 !important",
        },
        "& .MuiAutocomplete-paper": {
          backgroundColor: `${colors.primary_bg} !important`,
          marginTop: "4px !important",
        },
        "& .MuiAutocomplete-popper": {
          backgroundColor: `${colors.primary_bg} !important`,
          "& .MuiPaper-root": {
            backgroundColor: `${colors.primary_bg} !important`,
          },
        },
        "& .MuiAutocomplete-option": {
          fontSize: "13px !important",
          paddingTop: "6px !important",
          paddingBottom: "6px !important",
          minHeight: "32px !important",
          backgroundColor: `${colors.primary_bg} !important`,
          color: `${colors.primary_text} !important`,
        },
        "& .MuiAutocomplete-option:hover": {
          backgroundColor: `${colors.hover_bg} !important`,
        },
        "& .MuiAutocomplete-option[aria-selected='true']": {
          backgroundColor: `${colors.primary_bg} !important`,
        },
        "& .MuiAutocomplete-option.Mui-focused": {
          backgroundColor: `${colors.hover_bg} !important`,
        },
        "& .MuiAutocomplete-noOptions": {
          backgroundColor: `${colors.primary_bg} !important`,
          color: `${colors.secondary_text} !important`,
        },
        "& .MuiAutocomplete-loading": {
          backgroundColor: `${colors.primary_bg} !important`,
          color: `${colors.secondary_text} !important`,
        },
      }}
      {...otherProps}
    />
  );
};

export default ItemNameAutocomplete;
