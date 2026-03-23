import React, { useMemo, useCallback } from "react";
import { HighlightedText } from "@/shared/components/display/HighlightedText";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { ExpenseThemedAutocomplete } from "@/shared/components/form/ExpenseThemedAutocomplete";
import { MappedEntityIcon } from "@/shared/components/icons";
import { useExpensePaymentMethods } from "../../hooks/list/useExpensePaymentMethods";
import { createFuzzyFilterOptions } from "@/shared/utils/fuzzy/expenseFuzzyUtils";
import {
  findPaymentMethodByValue,
  arePaymentMethodsEqual,
  getPaymentMethodDisplayLabel,
} from "@/domain/shared/paymentMethod.utils";

export function PaymentMethodAutocomplete({
  value,
  onChange,
  options,
  friendId = "",
  transactionType = "loss",
  autofetch = true,
  placeholder,
  noDataText,
  error = false,
}) {
  const { t } = useLanguage();
  const resolvedPlaceholder = placeholder ?? t("expenseForm.placeholders.paymentMethod");
  const resolvedNoDataText = noDataText ?? t("expenseForm.actions.noPaymentMethods");
  const hasExternalOptions = Array.isArray(options);
  const {
    processedPaymentMethods,
    loading,
    error: paymentMethodsError,
    refetch,
  } = useExpensePaymentMethods(
    friendId,
    transactionType,
    hasExternalOptions ? false : autofetch,
  );

  const resolvedOptions = useMemo(
    () => (hasExternalOptions ? options : processedPaymentMethods),
    [hasExternalOptions, options, processedPaymentMethods],
  );

  const selectedOption = useMemo(
    () => findPaymentMethodByValue(resolvedOptions, value),
    [resolvedOptions, value],
  );

  const filterOptions = useMemo(
    () =>
      createFuzzyFilterOptions({
        getOptionLabel: getPaymentMethodDisplayLabel,
      }),
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
      onChange?.(nextValue?.value || "");
    },
    [onChange],
  );

  const noOptionsText = loading
    ? t("expenseForm.actions.loadingPaymentMethods")
    : paymentMethodsError
      ? t("expenseForm.actions.paymentMethodsLoadError")
      : resolvedNoDataText;

  return (
    <ExpenseThemedAutocomplete
      options={resolvedOptions}
      value={selectedOption}
      onChange={handleChange}
      onOpen={hasExternalOptions ? undefined : refetch}
      getOptionLabel={getPaymentMethodDisplayLabel}
      isOptionEqualToValue={arePaymentMethodsEqual}
      filterOptions={filterOptions}
      placeholder={resolvedPlaceholder}
      noOptionsText={hasExternalOptions ? resolvedNoDataText : noOptionsText}
      error={error}
      loading={hasExternalOptions ? false : loading}
      maxWidth="100%"
      startAdornment={
        selectedOption ? (
          <MappedEntityIcon
            variant="paymentMethod"
            value={selectedOption?.value || selectedOption?.label || selectedOption?.name}
          />
        ) : null
      }
      renderOption={(option, state) => (
        <span className="inline-flex w-full items-center gap-2">
          <MappedEntityIcon
            variant="paymentMethod"
            value={option?.value || option?.label || option?.name}
          />
          <HighlightedText
            text={getPaymentMethodDisplayLabel(option)}
            query={state.inputValue}
            title={getPaymentMethodDisplayLabel(option)}
          />
        </span>
      )}
    />
  );
}

export default PaymentMethodAutocomplete;
