import React from "react";
import { HighlightedText } from "@/shared/components/display/HighlightedText";
import { cn } from "@/lib/utils";
import { EXPENSE_FORM_LAYOUT } from "@/shared/constants/expenseFormLayout";
import { LinkedEntityTablePanel } from "@/shared/components/form/LinkedEntityTablePanel";
import { BudgetSelectionTable } from "@/shared/components/entity-form/budget/BudgetSelectionTable";
import { ExpenseFormRow } from "@/shared/components/entity-form/ExpenseFormRow";
import { ExpenseFieldLayout } from "@/shared/components/entity-form/ExpenseFieldLayout";
import { ExpenseThemedAmountField } from "./ExpenseThemedAmountField";
import { ExpenseThemedDatePicker } from "@/shared/components/entity-form/ExpenseThemedDatePicker";
import { ExpenseThemedCommentField } from "./ExpenseThemedCommentField";
import { ExpenseThemedAutocomplete } from "@/shared/components/form/ExpenseThemedAutocomplete";
import { ExpenseNameAutocomplete } from "@/shared/components/entity-form/ExpenseNameAutocomplete";
import { CategoryAutocomplete } from "./CategoryAutocomplete";
import { PaymentMethodAutocomplete } from "./PaymentMethodAutocomplete";
import { AutoFillBadge } from "@/shared/components/entity-form/AutoFillBadge";

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
  autoFillNoticeToken = 0,
}) {
  return (
    <div className={cn("mt-1 flex flex-col gap-1 lg:gap-2", showTable && "pb-2", className)}>
      <ExpenseFormRow first className="md:grid md:grid-cols-2 md:gap-2 xl:flex xl:gap-3">
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
            height={EXPENSE_FORM_LAYOUT.controlHeightRem}
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
            height={EXPENSE_FORM_LAYOUT.controlHeightRem}
            width="100%"
          />
        </ExpenseFieldLayout>
      </ExpenseFormRow>

      <ExpenseFormRow className="md:grid md:grid-cols-2 md:gap-2 xl:flex xl:gap-3">
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
            <AutoFillBadge
              key={`exp-af-tt-${autoFillNoticeToken}`}
              visible={isCreateMode && autoFilledFields.transactionType}
            />
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
            <AutoFillBadge
              key={`exp-af-cat-${autoFillNoticeToken}`}
              visible={isCreateMode && autoFilledFields.category}
            />
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
            <AutoFillBadge
              key={`exp-af-pm-${autoFillNoticeToken}`}
              visible={isCreateMode && autoFilledFields.paymentMethod}
            />
          </div>
        </ExpenseFieldLayout>
      </ExpenseFormRow>

      <ExpenseFormRow>
        <ExpenseFieldLayout
          label={t(labels.comments)}
          htmlFor="comments"
          layout="horizontal"
          contentClassName="w-full max-w-full lg:max-w-[min(100%,47.5rem)]"
        >
          <div className="relative">
            <AutoFillBadge
              key={`exp-af-com-${autoFillNoticeToken}`}
              visible={isCreateMode && autoFilledFields.comments}
              className="top-[-1.25rem] right-0 translate-x-0 lg:right-auto lg:left-[18.75rem]"
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
        summaryWhenClosed={
          showTable
            ? undefined
            : selectedBudgetIds.length === 0
              ? t("expenseForm.noBudgetsSelected")
              : t("expenseForm.budgetsSelectedCount", { count: selectedBudgetIds.length })
        }
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
