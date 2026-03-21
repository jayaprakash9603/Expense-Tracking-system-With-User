import React, { useMemo, useCallback } from "react";
import { HighlightedText } from "@/shared/components/display/HighlightedText";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { ExpenseThemedAutocomplete } from "@/shared/components/form/ExpenseThemedAutocomplete";
import {
  findExactNameMatch,
  areNamesEqual,
  sanitizeName,
} from "@/shared/utils/expense/expenseNameUtils";
import { createFuzzyFilterOptions } from "@/shared/utils/fuzzy/expenseFuzzyUtils";

const filterExpenseNamesFuzzy = createFuzzyFilterOptions();

export function FlowExpenseNameSearch({
  value = "",
  onChange,
  options,
  placeholder,
  noDataText,
  maxSuggestions = 500,
  maxWidth = "100%",
  inputHeight = "48px",
  className,
}) {
  const { t } = useLanguage();
  const resolvedPlaceholder = placeholder ?? t("common.search");
  const resolvedNoDataText = noDataText ?? t("expenseForm.actions.noExpenseNames");
  const limitedOptions = useMemo(() => {
    if (!Array.isArray(options)) return [];
    return options.slice(0, maxSuggestions);
  }, [options, maxSuggestions]);

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
      const sanitized = sanitizeName(inputValue);
      onChange?.(sanitized);
      const exactMatch = findExactNameMatch(limitedOptions, sanitized);
      if (exactMatch && !areNamesEqual(exactMatch, value)) {
        onChange?.(exactMatch);
      }
    },
    [onChange, limitedOptions, value],
  );

  return (
    <ExpenseThemedAutocomplete
      options={limitedOptions}
      value={value}
      onChange={handleValueChange}
      onInputChange={handleInputChange}
      filterOptions={filterExpenseNamesFuzzy}
      placeholder={resolvedPlaceholder}
      noOptionsText={resolvedNoDataText}
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
