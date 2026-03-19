import React, { useMemo, useCallback } from "react";
import { HighlightedText } from "@/shared/components/display/HighlightedText";
import { ExpenseThemedAutocomplete } from "./ExpenseThemedAutocomplete";
import { useExpenseNames } from "../../hooks/useExpenseNames";
import {
  findExactNameMatch,
  areNamesEqual,
  sanitizeName,
} from "../../utils/expenseNameUtils";

export function ExpenseNameAutocomplete({
  value = "",
  onChange,
  options,
  friendId = "",
  autofetch = true,
  placeholder = "Enter name",
  error = false,
  noDataText = "No expense names found",
  maxSuggestions = 500,
}) {
  const hasExternalOptions = Array.isArray(options);
  const {
    suggestions,
    loading,
    error: namesError,
    setInputValue,
    fetchNames,
  } = useExpenseNames(
    friendId,
    hasExternalOptions ? false : autofetch,
    maxSuggestions,
  );

  const limitedOptions = useMemo(
    () => {
      const source = hasExternalOptions ? options : suggestions;
      if (!Array.isArray(source)) return [];
      return source.slice(0, maxSuggestions);
    },
    [hasExternalOptions, options, suggestions, maxSuggestions],
  );

  const handleValueChange = useCallback(
    (_, nextValue) => {
      if (typeof nextValue !== "string") return;
      onChange?.(sanitizeName(nextValue));
    },
    [onChange],
  );

  const handleInputChange = useCallback(
    (_, inputValue, reason) => {
      if (reason !== "input") return;
      if (!hasExternalOptions) {
        setInputValue(inputValue);
      }
      const sanitized = sanitizeName(inputValue);
      onChange?.(sanitized);
      const exactMatch = findExactNameMatch(limitedOptions, sanitized);
      if (exactMatch && !areNamesEqual(exactMatch, value)) {
        onChange?.(exactMatch);
      }
    },
    [onChange, limitedOptions, value, hasExternalOptions, setInputValue],
  );

  const noOptionsText = loading
    ? "Loading names..."
    : namesError
      ? "Error loading names"
      : noDataText;

  return (
    <ExpenseThemedAutocomplete
      options={limitedOptions}
      value={value}
      onChange={handleValueChange}
      onInputChange={handleInputChange}
      onOpen={hasExternalOptions ? undefined : fetchNames}
      placeholder={placeholder}
      noOptionsText={hasExternalOptions ? noDataText : noOptionsText}
      error={error}
      loading={hasExternalOptions ? false : loading}
      freeSolo
      maxWidth="300px"
      renderOption={(option, state) => (
        <HighlightedText text={option} query={state.inputValue} title={option} />
      )}
    />
  );
}

export default ExpenseNameAutocomplete;
