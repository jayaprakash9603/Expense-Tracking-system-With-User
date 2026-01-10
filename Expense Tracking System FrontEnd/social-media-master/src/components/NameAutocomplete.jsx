import React, { useMemo } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import useExpenseNameSuggestions from "../hooks/useExpenseNameSuggestions";
import HighlightedText from "./common/HighlightedText";
import { createFuzzyFilterOptions } from "../utils/fuzzyMatchUtils";

/**
 * Generic NameAutocomplete component
 * Props:
 *  value: current string value
 *  onChange: (newValue) => void
 *  label: optional label text (rendered externally by parent usually)
 *  placeholder: input placeholder
 *  error: boolean to show error style
 *  disabled: disable input
 *  autoFetch: auto trigger fetch on mount
 *  sx: MUI style overrides for Autocomplete root
 */
const NameAutocomplete = ({
  value = "",
  onChange,
  placeholder = "Enter name",
  error = false,
  disabled = false,
  autoFetch = true,
  sx = {},
  size = "medium",
}) => {
  const { suggestions, loading, setInputValue, inputValue, fetchIfNeeded } =
    useExpenseNameSuggestions({ autoFetch });

  const filterOptions = useMemo(() => {
    return createFuzzyFilterOptions({
      getOptionLabel: (opt) => String(opt ?? ""),
    });
  }, []);

  return (
    <Autocomplete
      freeSolo
      autoHighlight
      disabled={disabled}
      options={suggestions}
      loading={loading}
      value={value}
      inputValue={inputValue || value}
      filterOptions={filterOptions}
      onOpen={fetchIfNeeded}
      onInputChange={(event, newValue) => {
        setInputValue(newValue);
        if (onChange) onChange(newValue || "");
      }}
      onChange={(event, newValue) => {
        if (onChange) onChange(newValue || "");
      }}
      noOptionsText={inputValue ? "No matches" : "No data"}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          placeholder={placeholder}
          error={error}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          sx={{
            "& .MuiInputBase-root": {
              backgroundColor: "#29282b",
              color: "#fff",
              height: size === "small" ? 40 : 56,
              fontSize: size === "small" ? 14 : 16,
            },
            "& .MuiInputBase-input": {
              color: "#fff",
              "&::placeholder": { color: "#9ca3af", opacity: 1 },
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: error ? "#ff4d4f" : "rgb(75, 85, 99)",
                borderWidth: "1px",
              },
              "&:hover fieldset": {
                borderColor: error ? "#ff4d4f" : "rgb(75, 85, 99)",
              },
              "&.Mui-focused fieldset": {
                borderColor: error ? "#ff4d4f" : "#00dac6",
                borderWidth: "2px",
              },
            },
          }}
        />
      )}
      renderOption={(props, option, { inputValue }) => (
        <li
          {...props}
          style={{
            fontSize: "0.92rem",
            paddingTop: 4,
            paddingBottom: 12,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 300,
          }}
          title={option}
        >
          <HighlightedText text={option} query={inputValue} title={option} />
        </li>
      )}
      sx={{ width: "100%", maxWidth: 300, ...sx }}
      size={size}
    />
  );
};

export default NameAutocomplete;
