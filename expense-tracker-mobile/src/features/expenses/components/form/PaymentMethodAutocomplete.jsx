import React, { useMemo, useCallback } from "react";
import { HighlightedText } from "@/shared/components/display/HighlightedText";
import { cn } from "@/lib/utils";
import { ExpenseThemedAutocomplete } from "./ExpenseThemedAutocomplete";
import { useExpensePaymentMethods } from "../../hooks/useExpensePaymentMethods";
import { createFuzzyFilterOptions } from "../../utils/expenseFuzzyUtils";
import {
  findPaymentMethodByValue,
  arePaymentMethodsEqual,
  getPaymentMethodDisplayLabel,
  getPaymentMethodIcon,
} from "../../utils/expensePaymentMethodUtils";

function PaymentIcon({ option, className }) {
  const Icon = getPaymentMethodIcon(option?.value || option?.label || option?.name);
  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}

export function PaymentMethodAutocomplete({
  value,
  onChange,
  options,
  friendId = "",
  transactionType = "loss",
  autofetch = true,
  placeholder = "Select payment method",
  noDataText = "No payment methods found",
  error = false,
}) {
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
    ? "Loading payment methods..."
    : paymentMethodsError
      ? "Error loading payment methods"
      : noDataText;

  return (
    <ExpenseThemedAutocomplete
      options={resolvedOptions}
      value={selectedOption}
      onChange={handleChange}
      onOpen={hasExternalOptions ? undefined : refetch}
      getOptionLabel={getPaymentMethodDisplayLabel}
      isOptionEqualToValue={arePaymentMethodsEqual}
      filterOptions={filterOptions}
      placeholder={placeholder}
      noOptionsText={hasExternalOptions ? noDataText : noOptionsText}
      error={error}
      loading={hasExternalOptions ? false : loading}
      maxWidth="100%"
      startAdornment={selectedOption ? <PaymentIcon option={selectedOption} /> : null}
      renderOption={(option, state) => (
        <span className="inline-flex w-full items-center gap-2">
          <PaymentIcon option={option} />
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
