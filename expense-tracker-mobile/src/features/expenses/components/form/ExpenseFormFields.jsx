import React from "react";
import { HighlightedText } from "@/shared/components/display/HighlightedText";
import { cn } from "@/lib/utils";
import { LinkedEntityTablePanel } from "@/shared/components/form/LinkedEntityTablePanel";
import { BudgetSelectionTable } from "../budget/BudgetSelectionTable";
import { ExpenseFormRow } from "./ExpenseFormRow";
import { ExpenseFieldLayout } from "./ExpenseFieldLayout";
import { ExpenseThemedAmountField } from "./ExpenseThemedAmountField";
import { ExpenseThemedDatePicker } from "./ExpenseThemedDatePicker";
import { ExpenseThemedCommentField } from "./ExpenseThemedCommentField";
import { ExpenseThemedAutocomplete } from "@/shared/components/form/ExpenseThemedAutocomplete";
import { ExpenseNameAutocomplete } from "./ExpenseNameAutocomplete";
import { CategoryAutocomplete } from "./CategoryAutocomplete";
import { PaymentMethodAutocomplete } from "./PaymentMethodAutocomplete";
import { AutoFillBadge } from "./AutoFillBadge";

export function ExpenseFormFields({
  t,
  formData,
  errors,
  setFieldValue,
  clearFieldError,
  friendId,
  showTable,
  setShowTable,
  budgets,
  budgetsLoading,
  budgetError,
  selectedBudgetIds,
  setSelectedBudgetIds,
  isCreateMode,
  autoFilledFields,
  markUserModified,
  handleDateChange,
  labels,
  placeholders,
  expenseTypeOptions,
  transactionTypeFilterOptions,
  formatTransactionTypeLabel,
  noExpenseNamesLabel,
  noOptionsLabel,
  linkBudgetsLabel,
  className,
}) {
  return (
    <div className={cn("mt-2 flex flex-col gap-3 lg:gap-4", showTable && "pb-2", className)}>
      <ExpenseFormRow first className="md:grid md:grid-cols-2 md:gap-3 xl:flex xl:gap-4">
        <ExpenseFieldLayout
          label={t(labels.expenseName)}
          htmlFor="expenseName"
          required
          error={errors.expenseName}
        >
          <ExpenseNameAutocomplete
            value={formData.expenseName}
            onChange={(value) => {
              setFieldValue("expenseName", value);
              clearFieldError("expenseName");
            }}
            friendId={friendId}
            placeholder={t(placeholders.expenseName)}
            error={Boolean(errors.expenseName)}
            maxSuggestions={500}
            noDataText={noExpenseNamesLabel}
          />
        </ExpenseFieldLayout>

        <ExpenseFieldLayout
          label={t(labels.amount)}
          htmlFor="amount"
          required
          error={errors.amount}
        >
          <ExpenseThemedAmountField
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={(event) => {
              setFieldValue("amount", event.target.value);
              clearFieldError("amount");
            }}
            placeholder={t(placeholders.amount)}
            error={Boolean(errors.amount)}
            height={48}
            maxWidth="100%"
          />
        </ExpenseFieldLayout>

        <ExpenseFieldLayout label={t(labels.date)} htmlFor="date" required error={errors.date}>
          <ExpenseThemedDatePicker
            value={formData.date}
            onChange={(nextDate) => {
              handleDateChange(nextDate);
            }}
            dateFormat="DD/MM/YYYY"
            error={Boolean(errors.date)}
            disableFuture
            placeholder={t(placeholders.date)}
            height={48}
            width="100%"
          />
        </ExpenseFieldLayout>
      </ExpenseFormRow>

      <ExpenseFormRow className="md:grid md:grid-cols-2 md:gap-3 xl:flex xl:gap-4">
        <ExpenseFieldLayout
          label={t(labels.transactionType)}
          htmlFor="transactionType"
          required
          error={errors.transactionType}
        >
          <div className="relative">
            <ExpenseThemedAutocomplete
              options={expenseTypeOptions}
              value={formData.transactionType}
              onChange={(_, value) => {
                const nextValue = String(value || "").toLowerCase();
                setFieldValue("transactionType", nextValue);
                clearFieldError("transactionType");
                markUserModified("transactionType");
              }}
              onInputChange={(_, nextValue, reason) => {
                if (reason === "clear") {
                  setFieldValue("transactionType", "");
                  clearFieldError("transactionType");
                }
              }}
              getOptionLabel={formatTransactionTypeLabel}
              isOptionEqualToValue={(option, value) =>
                String(option || "").toLowerCase() === String(value || "").toLowerCase()
              }
              filterOptions={transactionTypeFilterOptions}
              placeholder={t(placeholders.transactionType)}
              noOptionsText={noOptionsLabel}
              error={Boolean(errors.transactionType)}
              renderOption={(option, state) => (
                <HighlightedText
                  text={formatTransactionTypeLabel(option)}
                  query={state.inputValue}
                  title={formatTransactionTypeLabel(option)}
                />
              )}
            />
            <AutoFillBadge visible={isCreateMode && autoFilledFields.transactionType} />
          </div>
        </ExpenseFieldLayout>

        <ExpenseFieldLayout
          label={t(labels.category)}
          htmlFor="category"
          error={errors.category}
        >
          <div className="relative">
            <CategoryAutocomplete
              value={formData.category}
              onChange={(categoryId) => {
                setFieldValue("category", categoryId);
                markUserModified("category");
              }}
              friendId={friendId}
              placeholder={t(placeholders.category)}
              error={Boolean(errors.category)}
            />
            <AutoFillBadge visible={isCreateMode && autoFilledFields.category} />
          </div>
        </ExpenseFieldLayout>

        <ExpenseFieldLayout label={t(labels.paymentMethod)} htmlFor="paymentMethod">
          <div className="relative">
            <PaymentMethodAutocomplete
              value={formData.paymentMethod}
              onChange={(value) => {
                setFieldValue("paymentMethod", value);
                markUserModified("paymentMethod");
              }}
              transactionType={formData.transactionType}
              friendId={friendId}
              placeholder={t(placeholders.paymentMethod)}
            />
            <AutoFillBadge visible={isCreateMode && autoFilledFields.paymentMethod} />
          </div>
        </ExpenseFieldLayout>
      </ExpenseFormRow>

      <ExpenseFormRow>
        <ExpenseFieldLayout
          label={t(labels.comments)}
          htmlFor="comments"
          layout="horizontal"
          contentClassName="w-full max-w-full lg:max-w-[760px]"
        >
          <div className="relative">
            <AutoFillBadge
              visible={isCreateMode && autoFilledFields.comments}
              className="top-[-20px] right-0 translate-x-0 lg:right-auto lg:left-[300px]"
            />
            <ExpenseThemedCommentField
              id="comments"
              name="comments"
              value={formData.comments}
              onChange={(event) => {
                setFieldValue("comments", event.target.value);
                markUserModified("comments");
              }}
              placeholder={t(placeholders.comments)}
              maxWidth="760px"
              minRows={2}
              maxRows={3}
            />
          </div>
        </ExpenseFieldLayout>
      </ExpenseFormRow>
      <LinkedEntityTablePanel
        linkLabel={linkBudgetsLabel}
        open={showTable}
        onOpenChange={setShowTable}
        error={budgetError}
        closeAriaLabel={t("common.close")}
      >
        <BudgetSelectionTable
          budgets={budgets}
          selectedBudgetIds={selectedBudgetIds}
          onSelectionChange={setSelectedBudgetIds}
          loading={budgetsLoading}
        />
      </LinkedEntityTablePanel>
    </div>
  );
}
