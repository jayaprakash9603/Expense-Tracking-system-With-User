import React, { useState, useEffect } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import itemService from "../../services/itemService";

const ItemNameAutocomplete = ({
  value = "",
  onChange,
  onInputChange,
  placeholder = "Item name",
  disabled = false,
  error = false,
  className = "",
  autoFocus = false,
  sx = {},
  ...otherProps
}) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false); // Add this state

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
        setOptions([]);
        setIsOpen(false);
        return;
      }
      const filtered = await itemService.searchItems(searchTerm);
      setOptions(filtered || []);
      setIsOpen((filtered || []).length > 0);
    } catch (error) {
      console.error("Error fetching item names:", error);
      setOptions([]);
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change with debouncing for future API calls
  const handleInputChange = (event, newInputValue, reason) => {
    setInputValue(newInputValue);
    fetchItemNames(newInputValue);

    if (onInputChange) {
      onInputChange(event, newInputValue, reason);
    }

    // Also trigger onChange for immediate validation updates
    if (onChange && reason !== "reset") {
      onChange(event, newInputValue, reason);
    }
  };

  // Handle selection change
  const handleChange = (event, newValue, reason) => {
    // Update local state immediately
    setInputValue(newValue || "");
    setIsOpen(false); // Close dropdown when selection is made

    if (onChange) {
      // Call the parent's onChange handler
      onChange(event, newValue, reason);

      // Force a re-render in the parent component after a small delay
      setTimeout(() => {
        // This ensures the parent component's validation runs
        if (onChange) {
          onChange(event, newValue, "forceUpdate");
        }
      }, 0);
    }
  };

  // Highlight matching text function (same as your existing implementation)
  const highlightText = (text, inputValue) => {
    if (!inputValue) return text;

    const regex = new RegExp(`(${inputValue})`, "gi");
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === inputValue.toLowerCase() ? (
        <span key={index} style={{ fontWeight: 700, color: "#00b8a0" }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Handle keyboard events for Enter key selection
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      // Prevent default behavior to stop dropdown from opening
      event.preventDefault();
      event.stopPropagation();

      if (options.length > 0 && inputValue) {
        // Find the first matching option
        const firstMatch = options.find((option) =>
          option.toLowerCase().includes(inputValue.toLowerCase())
        );

        if (firstMatch) {
          // Use the first match
          handleChange(event, firstMatch, "selectOption");
          setInputValue(firstMatch);
        } else {
          // Use the input value directly if no match found
          handleChange(event, inputValue, "selectOption");
        }
      } else if (inputValue) {
        // If no options but there's input value, use the input value directly
        handleChange(event, inputValue, "selectOption");
      }

      // Close the dropdown explicitly
      setIsOpen(false);

      // Close the dropdown and blur the input
      setTimeout(() => {
        if (event.target) {
          event.target.blur();
        }
      }, 0);
    }
  };

  const fieldStyles =
    "px-2 py-1 rounded bg-[#29282b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00dac6] w-full text-sm sm:max-w-[300px] max-w-[200px] border-0";

  return (
    <Autocomplete
      freeSolo
      autoHighlight
      options={options}
      loading={loading}
      loadingText="Loading"
      noOptionsText={inputValue ? "No Data Found" : ""}
      value={value}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={handleChange}
      disabled={disabled}
      open={isOpen && inputValue.length > 0} // Use isOpen state instead
      onOpen={() => setIsOpen(true)} // Handle open event
      onClose={() => setIsOpen(false)} // Handle close event
      size="small"
      sx={{
        width: "100%",
        maxWidth: "300px",
        "& .MuiInputBase-root": {
          height: "37px",
          minHeight: "37px",
          fontSize: "14px",
          backgroundColor: "#29282b",
        },
        "& .MuiInputBase-input": {
          padding: "4px 8px",
          height: "24px",
          fontSize: "14px",
          backgroundColor: "#29282b",
          color: "#fff",
        },
        "& .MuiOutlinedInput-root": {
          backgroundColor: "#29282b",
          "& fieldset": {
            border: "none",
          },
          "&:hover fieldset": {
            border: "none",
          },
          "&.Mui-focused fieldset": {
            border: "none",
          },
        },
        "& .MuiAutocomplete-endAdornment": {
          right: "6px",
          "& .MuiSvgIcon-root": {
            fontSize: "16px",
            color: "#9ca3af",
          },
        },
        ...sx,
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          variant="outlined"
          error={error}
          autoFocus={autoFocus}
          onKeyDown={handleKeyDown}
          size="small"
          InputProps={{
            ...params.InputProps,
            style: {
              height: "32px",
              padding: "0",
              fontSize: "14px",
            },
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={16} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          inputProps={{
            ...params.inputProps,
            style: {
              padding: "4px 8px",
              height: "24px",
              fontSize: "14px",
            },
          }}
        />
      )}
      renderOption={(props, option, { inputValue }) => {
        const { key, ...optionProps } = props;
        return (
          <li
            key={key}
            {...optionProps}
            className="mb-1 ml-2"
            style={{
              backgroundColor: "#29282b",
              color: "#fff",
              fontSize: "13px",
              padding: "6px 10px",
              borderBottom: "1px solid #444",
              cursor: "pointer",
              minHeight: "28px",
            }}
          >
            <div>{highlightText(option, inputValue)}</div>
          </li>
        );
      }}
      ListboxProps={{
        style: {
          backgroundColor: "#29282b",
          border: "1px solid #444",
          borderRadius: "4px",
          maxHeight: "160px",
        },
      }}
      PaperComponent={({ children, ...other }) => (
        <div
          {...other}
          style={{
            backgroundColor: "#29282b",
            border: "1px solid #444",
            borderRadius: "4px",
          }}
        >
          {children}
        </div>
      )}
      className={className}
      {...otherProps}
    />
  );
};

export default ItemNameAutocomplete;
