import React, { useMemo, useCallback } from "react";
import { HighlightedText } from "@/shared/components/display/HighlightedText";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { getCategoryIcon } from "@/config/navigation/iconMapping";
import { cn } from "@/lib/utils";
import { ExpenseThemedAutocomplete } from "@/shared/components/form/ExpenseThemedAutocomplete";
import { useExpenseCategories } from "../../hooks/useExpenseCategories";
import {
  deduplicateCategories,
  filterCategoriesWithDeduplication,
  findCategoryById,
  areCategoriesEqual,
  getCategoryDisplayName,
} from "../../utils/expenseCategoryUtils";

function CategoryIcon({ category, className }) {
  const Icon = getCategoryIcon(category?.icon || category?.name);
  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
        className,
      )}
      style={{
        backgroundColor: category?.color ? `${category.color}20` : undefined,
        color: category?.color || undefined,
      }}
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}

export function CategoryAutocomplete({
  value,
  onChange,
  options,
  friendId = "",
  autofetch = true,
  placeholder,
  noDataText,
  error = false,
}) {
  const { t } = useLanguage();
  const resolvedPlaceholder = placeholder ?? t("expenseForm.placeholders.category");
  const resolvedNoDataText = noDataText ?? t("expenseForm.actions.noCategories");
  const hasExternalOptions = Array.isArray(options);
  const {
    uniqueCategories,
    loading,
    error: categoriesError,
    refetch,
  } = useExpenseCategories(friendId, hasExternalOptions ? false : autofetch);

  const dedupedOptions = useMemo(() => {
    const source = hasExternalOptions ? options : uniqueCategories;
    return deduplicateCategories(source);
  }, [hasExternalOptions, options, uniqueCategories]);

  const selectedCategory = useMemo(
    () => findCategoryById(dedupedOptions, value),
    [dedupedOptions, value],
  );

  const fuzzyFilter = useCallback(
    (list, state) => filterCategoriesWithDeduplication(list, state?.inputValue || ""),
    [],
  );

  const handleChange = useCallback(
    (_, nextValue) => {
      if (!nextValue) {
        onChange?.("");
        return;
      }
      if (typeof nextValue === "string") {
        onChange?.(nextValue);
        return;
      }
      onChange?.(nextValue?.id ?? "");
    },
    [onChange],
  );

  const noOptionsText = loading
    ? t("expenseForm.actions.loadingCategories")
    : categoriesError
      ? t("expenseForm.actions.categoriesLoadError")
      : resolvedNoDataText;

  return (
    <ExpenseThemedAutocomplete
      options={dedupedOptions}
      value={selectedCategory}
      onChange={handleChange}
      onOpen={hasExternalOptions ? undefined : refetch}
      getOptionLabel={getCategoryDisplayName}
      isOptionEqualToValue={areCategoriesEqual}
      filterOptions={fuzzyFilter}
      placeholder={resolvedPlaceholder}
      noOptionsText={hasExternalOptions ? resolvedNoDataText : noOptionsText}
      error={error}
      loading={hasExternalOptions ? false : loading}
      maxWidth="100%"
      startAdornment={selectedCategory ? <CategoryIcon category={selectedCategory} /> : null}
      renderOption={(option, state) => (
        <span className="inline-flex w-full items-center gap-2">
          <CategoryIcon category={option} />
          <HighlightedText
            text={getCategoryDisplayName(option)}
            query={state.inputValue}
            title={getCategoryDisplayName(option)}
          />
        </span>
      )}
    />
  );
}

export default CategoryAutocomplete;
