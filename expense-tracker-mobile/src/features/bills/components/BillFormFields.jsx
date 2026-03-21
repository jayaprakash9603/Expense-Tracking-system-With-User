import { useMemo, useCallback } from "react";
import { HighlightedText } from "@/shared/components/display/HighlightedText";
import { cn } from "@/lib/utils";
import { BILL_TYPE_OPTIONS } from "@/domain/bills/bill.model";
import { createFuzzyFilterOptions } from "@/shared/utils/fuzzy/expenseFuzzyUtils";
import { ExpenseFormRow } from "@/features/expenses/components/form/ExpenseFormRow";
import { ExpenseFieldLayout } from "@/features/expenses/components/form/ExpenseFieldLayout";
import { computeBillExpensesTotal, filterValidBillExpenses } from "@/domain/bills/billExpenseLineUtils";
import { useMoneyFormatter } from "@/shared/hooks/settings/useMoneyFormatter";
import { ExpenseThemedDatePicker } from "@/features/expenses/components/form/ExpenseThemedDatePicker";
import { ExpenseThemedAutocomplete } from "@/shared/components/form/ExpenseThemedAutocomplete";
import { ExpenseNameAutocomplete } from "@/features/expenses/components/form/ExpenseNameAutocomplete";
import { CategoryAutocomplete } from "@/features/expenses/components/form/CategoryAutocomplete";
import { PaymentMethodAutocomplete } from "@/features/expenses/components/form/PaymentMethodAutocomplete";
import { AutoFillBadge } from "@/features/expenses/components/form/AutoFillBadge";
import { AppInput } from "@/shared/components/form/AppInput";

function formatBillTypeLabel(value) {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "gain") return "Gain";
  if (normalized === "loss") return "Loss";
  return value || "";
}

export function BillFormFields({
  t,
  formData,
  errors,
  handleChange,
  labels,
  placeholders,
  friendId = "",
  handleDateChange,
  autoFilledFields,
  markUserModified,
  isCreateMode,
  noExpenseNamesLabel,
  noOptionsLabel,
}) {
  const resolveError = (key) => (errors[key] ? t(errors[key]) : undefined);

  const transactionTypeFilterOptions = useMemo(
    () =>
      createFuzzyFilterOptions({
        getOptionLabel: formatBillTypeLabel,
      }),
    [],
  );

  const { format } = useMoneyFormatter();
  const lineItemsTotal = useMemo(
    () => computeBillExpensesTotal(filterValidBillExpenses(formData.expenses || [])),
    [formData.expenses],
  );

  const onNameChange = useCallback(
    (value) => {
      handleChange("name", value);
    },
    [handleChange],
  );

  return (
    <div className={cn("mt-2 flex flex-col gap-3 lg:gap-4")}>
      <ExpenseFormRow first className="md:grid md:grid-cols-2 md:gap-3 xl:flex xl:gap-4">
        <ExpenseFieldLayout
          label={t(labels.name)}
          htmlFor="bill-name"
          required
          error={resolveError("name")}
        >
          <ExpenseNameAutocomplete
            value={formData.name ?? ""}
            onChange={onNameChange}
            friendId={friendId}
            placeholder={t(placeholders.name)}
            error={Boolean(errors.name)}
            maxSuggestions={500}
            noDataText={noExpenseNamesLabel}
          />
        </ExpenseFieldLayout>

        <ExpenseFieldLayout label={t(labels.description)} htmlFor="bill-description">
          <div className="relative">
            <AppInput
              id="bill-description"
              value={formData.description ?? ""}
              onChange={(e) => {
                handleChange("description", e.target.value);
                markUserModified("description");
              }}
              placeholder={t(placeholders.description)}
              intent="default"
            />
            <AutoFillBadge visible={isCreateMode && autoFilledFields.description} />
          </div>
        </ExpenseFieldLayout>

        <ExpenseFieldLayout label={t(labels.date)} htmlFor="bill-date" required error={resolveError("date")}>
          <ExpenseThemedDatePicker
            value={formData.date}
            onChange={(next) => handleDateChange(next)}
            dateFormat="DD/MM/YYYY"
            error={Boolean(errors.date)}
            disableFuture={false}
            placeholder={t(placeholders.date)}
            height={48}
            width="100%"
          />
        </ExpenseFieldLayout>
      </ExpenseFormRow>

      <ExpenseFormRow className="md:grid md:grid-cols-2 md:gap-3 xl:flex xl:gap-4">
        <ExpenseFieldLayout
          label={t(labels.type)}
          htmlFor="bill-type"
          required
          error={resolveError("type")}
        >
          <div className="relative">
            <ExpenseThemedAutocomplete
              options={BILL_TYPE_OPTIONS}
              value={formData.type || ""}
              onChange={(_, value) => {
                const nextValue = String(value || "").toLowerCase();
                handleChange("type", nextValue);
                markUserModified("type");
              }}
              onInputChange={(_, nextValue, reason) => {
                if (reason === "clear") {
                  handleChange("type", "");
                }
              }}
              getOptionLabel={formatBillTypeLabel}
              isOptionEqualToValue={(option, value) =>
                String(option || "").toLowerCase() === String(value || "").toLowerCase()
              }
              filterOptions={transactionTypeFilterOptions}
              placeholder={t(placeholders.type)}
              noOptionsText={noOptionsLabel}
              error={Boolean(errors.type)}
              renderOption={(option, state) => (
                <HighlightedText
                  text={formatBillTypeLabel(option)}
                  query={state.inputValue}
                  title={formatBillTypeLabel(option)}
                />
              )}
            />
            <AutoFillBadge visible={isCreateMode && autoFilledFields.type} />
          </div>
        </ExpenseFieldLayout>

        <ExpenseFieldLayout label={t(labels.paymentMethod)} htmlFor="bill-payment">
          <div className="relative">
            <PaymentMethodAutocomplete
              value={formData.paymentMethod}
              onChange={(value) => {
                handleChange("paymentMethod", value);
                markUserModified("paymentMethod");
              }}
              transactionType={formData.type}
              friendId={friendId}
              placeholder={t(placeholders.paymentMethod)}
            />
            <AutoFillBadge visible={isCreateMode && autoFilledFields.paymentMethod} />
          </div>
        </ExpenseFieldLayout>

        <ExpenseFieldLayout label={t(labels.category)} htmlFor="bill-category">
          <div className="relative">
            <CategoryAutocomplete
              value={formData.categoryId}
              onChange={(categoryId) => {
                handleChange("categoryId", categoryId);
                markUserModified("categoryId");
              }}
              friendId={friendId}
              placeholder={t(placeholders.category)}
              error={Boolean(errors.categoryId)}
            />
            <AutoFillBadge visible={isCreateMode && autoFilledFields.categoryId} />
          </div>
        </ExpenseFieldLayout>
      </ExpenseFormRow>

      <ExpenseFormRow className="md:grid md:grid-cols-2 md:gap-3 xl:flex xl:gap-4">
        <ExpenseFieldLayout
          label={t(labels.totalFromLines)}
          htmlFor="bill-total-from-lines"
          required
          error={resolveError("amount")}
        >
          <div
            id="bill-total-from-lines"
            className={cn(
              "flex min-h-12 items-center justify-end rounded-md border bg-muted/30 px-3 text-base font-semibold tabular-nums",
              errors.amount ? "border-destructive" : "border-border/60",
            )}
          >
            {lineItemsTotal > 0 ? format(lineItemsTotal) : "—"}
          </div>
        </ExpenseFieldLayout>
      </ExpenseFormRow>
    </div>
  );
}

export default BillFormFields;
