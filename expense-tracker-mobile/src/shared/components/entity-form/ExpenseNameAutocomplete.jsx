import React, { useMemo, useCallback } from "react";
import { HighlightedText } from "@/shared/components/display/HighlightedText";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { ExpenseThemedAutocomplete } from "@/shared/components/form/ExpenseThemedAutocomplete";
import { useExpenseNames } from "@/shared/hooks/useExpenseNames";
import {
  findExactNameMatch,
  areNamesEqual,
  sanitizeName,
} from "@/shared/utils/expense/expenseNameUtils";
import { createFuzzyFilterOptions } from "@/shared/utils/fuzzy/expenseFuzzyUtils";
import { EXPENSE_FORM_LAYOUT } from "@/shared/constants/expenseFormLayout";

const filterExpenseNamesFuzzy = createFuzzyFilterOptions();

export function ExpenseNameAutocomplete({
  value = "",
  onChange,
  options,
  friendId = "",
  autofetch = true,
  placeholder,
  error = false,
  noDataText,
  maxSuggestions = 500,
  maxWidth = "100%",
  inputHeight = EXPENSE_FORM_LAYOUT.controlHeightRem,
  className,
}) {
  const { t } = useLanguage();
  const resolvedPlaceholder = placeholder ?? t("expenseForm.placeholders.expenseName");
  const resolvedNoDataText = noDataText ?? t("expenseForm.actions.noExpenseNames");
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
    ? t("expenseForm.actions.loadingNames")
    : namesError
      ? t("expenseForm.actions.namesLoadError")
      : resolvedNoDataText;

  return (
    <ExpenseThemedAutocomplete
      options={limitedOptions}
      value={value}
      onChange={handleValueChange}
      onInputChange={handleInputChange}
      onOpen={hasExternalOptions ? undefined : fetchNames}
      filterOptions={filterExpenseNamesFuzzy}
      placeholder={resolvedPlaceholder}
      noOptionsText={hasExternalOptions ? resolvedNoDataText : noOptionsText}
      error={error}
      loading={hasExternalOptions ? false : loading}
      freeSolo
      maxWidth={maxWidth}
      inputHeight={inputHeight}
      className={className}
      renderOption={(option, state) => (
        <HighlightedText text={option} query={state.inputValue} title={option} />
      )}
    />
  );
}

export default ExpenseNameAutocomplete;
