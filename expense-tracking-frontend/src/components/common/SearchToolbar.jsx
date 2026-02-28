import React, { useMemo, useState, useCallback } from "react";
import { IconButton } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import { useTheme } from "../../hooks/useTheme";
import { AppAutocomplete } from "../ui";

/**
 * VS Code-like fuzzy sequence matching
 * Matches characters in sequence (not necessarily consecutive)
 * e.g., "dfm" matches "Dry Fruits For Mother" (d...f...m)
 * Returns match score for sorting (lower is better match)
 */
const fuzzyMatch = (text, pattern) => {
  if (!pattern) return { matches: true, score: 0 };
  if (!text) return { matches: false, score: Infinity };

  const textLower = text.toLowerCase();
  const patternLower = pattern.toLowerCase();

  let patternIdx = 0;
  let score = 0;
  let lastMatchIdx = -1;
  let consecutiveBonus = 0;

  for (
    let i = 0;
    i < textLower.length && patternIdx < patternLower.length;
    i++
  ) {
    if (textLower[i] === patternLower[patternIdx]) {
      // Bonus for consecutive matches
      if (lastMatchIdx === i - 1) {
        consecutiveBonus += 1;
      }
      // Bonus for matching at word start
      if (i === 0 || /\s/.test(text[i - 1])) {
        score -= 10;
      }
      // Penalty for gaps between matches
      if (lastMatchIdx >= 0) {
        score += i - lastMatchIdx - 1;
      }
      lastMatchIdx = i;
      patternIdx++;
    }
  }

  // All pattern characters must be found
  if (patternIdx !== patternLower.length) {
    return { matches: false, score: Infinity };
  }

  // Apply consecutive bonus
  score -= consecutiveBonus * 5;

  return { matches: true, score };
};

/**
 * Generic search + filter toolbar with autocomplete support.
 * Features VS Code-like fuzzy matching for suggestions.
 * Search is triggered only when an option is selected from dropdown.
 */
const SearchToolbar = ({
  search,
  setSearch,
  onFilterClick,
  filterRef,
  isMobile,
  isTablet,
  placeholder = "Search...",
  autocompleteOptions = [],
}) => {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(search || ""); // Local input state for typing

  // Convert options to label/value format (supports both string arrays and object arrays)
  const options = useMemo(() => {
    if (!autocompleteOptions || autocompleteOptions.length === 0) return [];

    // If it's already an array of strings (from API), just map to label/value
    if (typeof autocompleteOptions[0] === "string") {
      return autocompleteOptions.map((label) => ({ label, value: label }));
    }

    // Legacy support: extract unique names from object arrays
    const uniqueOptionsMap = new Map();

    const addOption = (value) => {
      if (value && typeof value === "string") {
        const trimmed = value.trim();
        const lowerKey = trimmed.toLowerCase();
        if (trimmed && !uniqueOptionsMap.has(lowerKey)) {
          uniqueOptionsMap.set(lowerKey, trimmed);
        }
      }
    };

    autocompleteOptions.forEach((item) => {
      addOption(item.name);
      addOption(item.expenseName);
    });

    return Array.from(uniqueOptionsMap.values())
      .sort((a, b) => a.localeCompare(b))
      .map((label) => ({ label, value: label }));
  }, [autocompleteOptions]);

  // VS Code-like fuzzy filter with scoring
  const filterOptions = useCallback((options, { inputValue }) => {
    if (!inputValue || !inputValue.trim()) return options;

    const pattern = inputValue.trim();

    // Filter and score options
    const scored = options
      .map((opt) => {
        const label = typeof opt === "string" ? opt : opt?.label || "";
        const result = fuzzyMatch(label, pattern);
        return { opt, ...result };
      })
      .filter((item) => item.matches)
      .sort((a, b) => a.score - b.score);

    return scored.map((item) => item.opt);
  }, []);

  // Check if we have matching options for the current input
  const hasMatchingOptions = useMemo(() => {
    if (!inputValue || !inputValue.trim()) return options.length > 0;
    return filterOptions(options, { inputValue }).length > 0;
  }, [options, inputValue, filterOptions]);

  // Handle selection from dropdown - this triggers the actual search
  const handleChange = useCallback(
    (event, newValue) => {
      if (typeof newValue === "string") {
        setSearch(newValue);
        setInputValue(newValue);
      } else if (newValue && newValue.label) {
        setSearch(newValue.label);
        setInputValue(newValue.label);
      } else {
        setSearch("");
        setInputValue("");
      }
      setOpen(false);
    },
    [setSearch],
  );

  // Handle typing - only updates local input, doesn't trigger search
  // Clears search when input is empty or when no matching options exist
  const handleInputChange = useCallback(
    (event, newInputValue, reason) => {
      if (reason === "input") {
        setInputValue(newInputValue);

        // If input is completely cleared, reset search and show all options
        if (!newInputValue || newInputValue.trim() === "") {
          setSearch("");
          // Keep dropdown open to show all available options
          if (options.length > 0) {
            setOpen(true);
          }
        } else {
          const matchingOptions = filterOptions(options, {
            inputValue: newInputValue,
          });

          if (matchingOptions.length > 0) {
            // Open dropdown if there are matching options
            setOpen(true);
          } else {
            // No matching options - clear search to show all expenses
            setSearch("");
            setOpen(false);
          }
        }
      } else if (reason === "clear") {
        setInputValue("");
        setSearch("");
        // Show all options after clearing
        if (options.length > 0) {
          setOpen(true);
        }
      }
    },
    [options, filterOptions, setSearch],
  );

  // Handle Enter key to search with current input
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter" && !open) {
        // If dropdown is closed, trigger search with current input
        setSearch(inputValue);
      }
    },
    [inputValue, open, setSearch],
  );

  const handleOpen = useCallback(() => {
    if (hasMatchingOptions) {
      setOpen(true);
    }
  }, [hasMatchingOptions]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: isMobile ? 6 : 8,
        alignItems: "center",
        width: "100%",
        maxWidth: isMobile ? "220px" : isTablet ? "280px" : "320px",
      }}
    >
      <AppAutocomplete
        open={open && hasMatchingOptions}
        onOpen={handleOpen}
        onClose={handleClose}
        options={options}
        filterOptions={filterOptions}
        inputValue={inputValue}
        value={null}
        onChange={handleChange}
        onInputChange={handleInputChange}
        onKeyDown={handleKeyDown}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option?.label || ""
        }
        isOptionEqualToValue={(option, value) => option?.label === value?.label}
        placeholder={placeholder}
        freeSolo
        clearOnBlur={false}
        disableClearable={false}
        size="small"
        noOptionsText={null}
        startAdornment={
          <SearchIcon
            sx={{
              color: colors.secondary_text,
              fontSize: isMobile ? 16 : 18,
              mr: 0.5,
            }}
          />
        }
        sx={{
          width: "100%",
          maxWidth: "100%",
          "& .MuiInputBase-root": {
            backgroundColor: colors.primary_bg,
            color: colors.primary_text,
            borderRadius: "8px",
            fontSize: isMobile ? "0.7rem" : "0.75rem",
            height: isMobile ? "32px" : "36px",
            padding: "0 8px !important",
          },
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: colors.active_text,
              borderWidth: "1px",
            },
            "&:hover fieldset": {
              borderColor: colors.primary_accent,
            },
            "&.Mui-focused fieldset": {
              borderColor: colors.primary_accent,
              borderWidth: "1px",
            },
          },
          "& .MuiAutocomplete-input": {
            padding: "0 !important",
            fontSize: isMobile ? "0.7rem" : "0.75rem",
          },
          "& .MuiAutocomplete-endAdornment": {
            right: "4px",
          },
          "& .MuiAutocomplete-clearIndicator": {
            color: colors.secondary_text,
            fontSize: "0.9rem",
          },
          "& .MuiAutocomplete-popupIndicator": {
            display: "none",
          },
          "& .MuiAutocomplete-noOptions": {
            display: "none",
          },
        }}
      />
      <IconButton
        sx={{ color: colors.active_text, flexShrink: 0, p: isMobile ? 0.5 : 1 }}
        onClick={onFilterClick}
        ref={filterRef}
      >
        <FilterListIcon fontSize={isMobile ? "small" : "small"} />
      </IconButton>
    </div>
  );
};

export default SearchToolbar;
