import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Link as LinkIcon,
  Close as CloseIcon,
  CameraAlt as CameraIcon,
} from "@mui/icons-material";
import {
  CategoryAutocomplete,
  PaymentMethodAutocomplete,
  ExpenseNameAutocomplete,
} from "../../../components/ui";
import PreviousExpenseIndicator from "../../../components/PreviousExpenseIndicator";
import usePreviousExpense from "../../expenses/hooks/usePreviousExpense";
import useBillAutoFill from "../hooks/useBillAutoFill";
import useBillFormState from "../hooks/useBillFormState";
import useBillExpenseItems from "../hooks/useBillExpenseItems";
import useBillDataLoader from "../hooks/useBillDataLoader";
import useBillSubmit from "../hooks/useBillSubmit";
import usePreserveNavigationState from "../../../hooks/usePreserveNavigationState";
import useFormPage from "../../../shared/form/hooks/useFormPage";
import FormPageShell from "../../../shared/form/components/FormPageShell";
import ThemedDatePicker from "../../../shared/form/fields/ThemedDatePicker";
import ThemedAutocomplete from "../../../shared/form/fields/ThemedAutocomplete";
import ThemedTextField from "../../../shared/form/fields/ThemedTextField";
import ThemedCommentField from "../../../shared/form/fields/ThemedCommentField";
import SubmitButton from "../../../shared/form/components/SubmitButton";
import ReceiptScanModal from "../../../components/ocr/ReceiptScanModal";
import BudgetSelectionTable from "../../../components/common/BudgetSelectionTable/BudgetSelectionTable";
import BillExpenseTable from "./BillExpenseTable";
import BillExpenseSummary from "./BillExpenseSummary";
import BillFormSkeleton from "./BillFormSkeleton";
import BillLoadError from "./BillLoadError";
import { REDIRECT_CONFIG, TYPE_OPTIONS } from "../utils/billFormUtils";

export default function BillFormPage({ mode, onClose, onSuccess, billId: propBillId }) {
  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";

  const {
    colors, t, dateFormat, currencySymbol, navigate, dispatch, params, friendId, hasWriteAccess,
  } = useFormPage({ redirectConfig: REDIRECT_CONFIG });

  const location = useLocation();
  const dateFromQuery = isCreateMode
    ? new URLSearchParams(location.search).get("date")
    : null;
  const { navigateWithState } = usePreserveNavigationState();
  const { id: paramId, expenseId } = params || {};
  const currentBillId = isEditMode ? (propBillId || paramId) : null;

  const {
    billData, setBillData, errors, setErrors,
    handleInputChange, handleTypeChange, handleDateChange,
    clearFieldError, resetFormData, syncAmountFromExpenses, today,
  } = useBillFormState({ isCreateMode, isEditMode, dateFromQuery, dispatch, friendId });

  const {
    expenses, setExpenses, tempExpenses,
    showExpenseTable, showBudgetTable, lastRowRef,
    handleTempExpenseChange, handleItemNameChange, addTempExpenseRow,
    removeTempExpenseRow, handleSaveExpenses, handleOpenExpenseTable,
    handleCloseExpenseTableWithConfirmation, handleToggleBudgetTable,
    handleCloseBudgetTable, resetExpenseState,
  } = useBillExpenseItems({ isCreateMode, t });

  const [selectedBudgets, setSelectedBudgets] = useState([]);
  const [showReceiptScanModal, setShowReceiptScanModal] = useState(false);

  const onDataLoaded = useCallback(({ formData, expenses: loadedExpenses, budgetIds }) => {
    setBillData(formData);
    setExpenses(loadedExpenses);
    setSelectedBudgets(budgetIds);
  }, [setBillData, setExpenses]);

  const { isLoading, loadError } = useBillDataLoader({
    isEditMode, currentBillId, expenseId, dispatch, friendId, t, onDataLoaded,
  });

  const { previousExpense, loadingPreviousExpense } = usePreviousExpense(
    isCreateMode ? billData.name : null,
    isCreateMode ? billData.date : null,
    isCreateMode ? friendId : null,
  );

  const { autoFilledFields, markUserModified } = useBillAutoFill(
    isCreateMode ? previousExpense : null,
    isCreateMode ? billData.name : null,
    billData,
    setBillData,
  );

  const { handleSubmit } = useBillSubmit({
    isCreateMode, isEditMode, billData, expenses, selectedBudgets,
    currentBillId, dispatch, friendId, t, setErrors, navigate,
    navigateWithState, onClose, onSuccess, resetFormData,
    resetExpenseState, dateFromQuery, today,
  });

  const {
    budgets = [],
    error: budgetError,
    loading: budgetLoading,
  } = useSelector((state) => state.budgets || {});
  const { loading: billLoading } = useSelector((state) => state.bills || {});

  useEffect(() => {
    syncAmountFromExpenses(expenses);
  }, [expenses, syncAmountFromExpenses]);

  const handleOcrDataExtracted = useCallback(
    (extractedData) => {
      if (!extractedData) return;
      setBillData((prev) => ({
        ...prev,
        name: extractedData.name || prev.name,
        description: extractedData.description || prev.description,
        amount: extractedData.amount?.toString() || prev.amount,
        paymentMethod: extractedData.paymentMethod || prev.paymentMethod,
        date: extractedData.date || prev.date,
      }));
      const successTitle = t("billCommon.receiptScanner.successMessage.title");
      const successBody = t("billCommon.receiptScanner.successMessage.body", {
        name: extractedData.name || t("common.notAvailable"),
        amount: `${currencySymbol}${extractedData.amount || "0"}`,
        date: extractedData.date || t("common.notAvailable"),
      });
      window.alert(`${successTitle}\n\n${successBody}`);
    },
    [setBillData, t, currencySymbol],
  );

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else if (isEditMode) {
      navigateWithState(-1, { preserve: false });
    } else {
      navigate(-1);
    }
  }, [onClose, isEditMode, navigateWithState, navigate]);

  if (isEditMode && loadError) {
    return <BillLoadError colors={colors} t={t} loadError={loadError} onClose={handleClose} />;
  }

  if (isEditMode && isLoading) {
    return <BillFormSkeleton colors={colors} t={t} onClose={handleClose} />;
  }

  const autoFillBadge = (field) => {
    if (!isCreateMode || !autoFilledFields[field]) return null;
    return (
      <div
        className="absolute top-[-24px] right-0"
        style={{
          background: "linear-gradient(135deg, #00dac6 0%, #00b8a0 100%)",
          color: "#fff",
          fontSize: "0.65rem",
          padding: "2px 6px",
          borderRadius: "4px",
          fontWeight: "600",
          whiteSpace: "nowrap",
          boxShadow: "0 2px 4px rgba(0,218,198,0.3)",
          zIndex: 10,
        }}
      >
        {t("billCommon.indicators.autoFilled")}
      </div>
    );
  };

  const labelStyle = {
    width: "150px",
    minWidth: "150px",
    display: "flex",
    alignItems: "center",
    color: colors.primary_text,
  };

  const pageTitle = isCreateMode ? t("createBill.title") : t("editBill.title");
  const expenseButtonLabel = showExpenseTable
    ? t("billCommon.actions.hideExpenses")
    : isCreateMode
      ? t("billCommon.actions.addExpenses")
      : t("billCommon.actions.editExpenses");
  const submitLabel = isCreateMode
    ? t("billCommon.actions.submit")
    : t("billCommon.actions.update");
  const expenseTableTitle = isCreateMode
    ? t("createBill.labels.expenseTableTitle")
    : t("editBill.labels.expenseTableTitle");
  const emptySubtitle = isCreateMode
    ? t("createBill.summary.noItemsSubtitle")
    : t("editBill.summary.noItemsSubtitle");

  return (
    <>
      <FormPageShell
        title={pageTitle}
        onClose={handleClose}
        colors={colors}
        rightContent={
          isCreateMode &&
          billData.name?.trim().length >= 2 &&
          billData.date && (
            <PreviousExpenseIndicator
              expense={previousExpense}
              isLoading={loadingPreviousExpense}
              position="right"
              variant="gradient"
              showTooltip={true}
              dateFormat={dateFormat}
              label={t("billCommon.indicators.previouslyAdded")}
              labelPosition="top"
              icon="calendar"
              tooltipConfig={{
                showAmount: true,
                showPaymentMethod: true,
                showType: true,
              }}
              colorScheme={{
                primary: "#00dac6",
                secondary: "#00b8a0",
                text: "#ffffff",
                subtext: "#9ca3af",
              }}
            />
          )
        }
        containerStyle={{ backgroundColor: colors.tertiary_bg }}
      >
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-1 gap-4 items-center">
            <div className="flex flex-col flex-1">
              <div className="flex items-center">
                <label htmlFor="name" className="text-sm sm:text-base font-semibold mr-4" style={labelStyle}>
                  {t("billCommon.fields.name")}
                  <span className="text-red-500"> *</span>
                </label>
                <div className="relative flex-1" style={{ maxWidth: "300px" }}>
                  <ExpenseNameAutocomplete
                    value={billData.name}
                    onChange={(val) => {
                      setBillData((prev) => ({ ...prev, name: val }));
                      clearFieldError("name");
                    }}
                    friendId={friendId}
                    placeholder={t("billCommon.placeholders.searchBillName")}
                    error={errors.name}
                    size="medium"
                    maxSuggestions={500}
                    noDataText="No expense names found"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col flex-1">
              <div className="flex items-center relative">
                <label htmlFor="description" className="text-sm sm:text-base font-semibold mr-4" style={labelStyle}>
                  {t("billCommon.fields.description")}
                </label>
                <div className="relative flex-1" style={{ maxWidth: "300px" }}>
                  {autoFillBadge("description")}
                  {isCreateMode ? (
                    <ThemedTextField
                      id="description"
                      name="description"
                      value={billData.description}
                      onChange={(e) => {
                        handleInputChange(e);
                        markUserModified("description");
                      }}
                      placeholder={t("billCommon.placeholders.description")}
                      colors={colors}
                    />
                  ) : (
                    <ThemedCommentField
                      id="description"
                      name="description"
                      value={billData.description}
                      onChange={handleInputChange}
                      placeholder={t("billCommon.placeholders.description")}
                      colors={colors}
                      minRows={1}
                      maxRows={3}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col flex-1">
              <div className="flex items-center">
                <label htmlFor="date" className="text-sm sm:text-base font-semibold mr-4" style={labelStyle}>
                  {t("billCommon.fields.date")}
                  <span className="text-red-500"> *</span>
                </label>
                <ThemedDatePicker
                  value={billData.date}
                  onChange={handleDateChange}
                  colors={colors}
                  dateFormat={dateFormat}
                  error={errors.date}
                  disableFuture
                  placeholder={dateFormat}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-1 gap-4 items-center">
            <div className="flex flex-col flex-1">
              <div className="flex items-center relative">
                <label htmlFor="type" className="text-sm sm:text-base font-semibold mr-4" style={labelStyle}>
                  {t("billCommon.fields.type")}
                  <span className="text-red-500"> *</span>
                </label>
                <div className="relative flex-1" style={{ maxWidth: "300px" }}>
                  <ThemedAutocomplete
                    options={TYPE_OPTIONS}
                    value={billData.type || ""}
                    onChange={(event, newValue) => {
                      handleTypeChange(event, newValue);
                      if (isCreateMode) markUserModified("type");
                    }}
                    getOptionLabel={(option) => t(`billCommon.typeOptions.${option}`)}
                    colors={colors}
                    error={errors.type}
                    placeholder={t("billCommon.placeholders.type")}
                  />
                  {autoFillBadge("type")}
                </div>
              </div>
            </div>

            <div className="flex flex-col flex-1">
              <div className="flex items-center relative">
                <label htmlFor="paymentMethod" className="text-sm sm:text-base font-semibold mr-4" style={labelStyle}>
                  {t("billCommon.fields.paymentMethod")}
                </label>
                <div className="relative flex-1" style={{ maxWidth: "300px" }}>
                  <PaymentMethodAutocomplete
                    value={billData.paymentMethod}
                    onChange={(val) => {
                      setBillData((prev) => ({ ...prev, paymentMethod: val }));
                      if (isCreateMode) markUserModified("paymentMethod");
                    }}
                    transactionType={billData.type}
                    friendId={friendId}
                    placeholder={t("billCommon.placeholders.paymentMethod")}
                    size="medium"
                  />
                  {autoFillBadge("paymentMethod")}
                </div>
              </div>
            </div>

            <div className="flex flex-col flex-1">
              <div className="flex items-center relative">
                <label htmlFor="category" className="text-sm sm:text-base font-semibold mr-4" style={labelStyle}>
                  {t("billCommon.fields.category")}
                </label>
                <div className="relative flex-1" style={{ maxWidth: "300px" }}>
                  <CategoryAutocomplete
                    value={billData.categoryId}
                    onChange={(categoryId) => {
                      setBillData((prev) => ({ ...prev, categoryId }));
                      if (isCreateMode) markUserModified("category");
                    }}
                    friendId={friendId}
                    placeholder={t("billCommon.placeholders.category")}
                    size="medium"
                  />
                  {autoFillBadge("category")}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              onClick={handleToggleBudgetTable}
              startIcon={<LinkIcon />}
              sx={{
                backgroundColor: showBudgetTable ? colors.button_hover : colors.button_bg,
                color: colors.button_text,
                "&:hover": { backgroundColor: colors.button_hover },
              }}
            >
              {showBudgetTable
                ? t("billCommon.actions.hideBudgets")
                : t("billCommon.actions.linkBudgets")}
            </Button>

            {isCreateMode && (
              <Tooltip title={t("billCommon.receiptScanner.tooltip")}>
                <Button
                  onClick={() => setShowReceiptScanModal(true)}
                  startIcon={<CameraIcon />}
                  sx={{
                    backgroundColor: colors.primary_accent || "#00dac6",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: colors.primary_accent_hover || "#00b8a0",
                    },
                  }}
                >
                  {t("billCommon.receiptScanner.buttonLabel")}
                </Button>
              </Tooltip>
            )}
          </div>

          <Button
            onClick={handleOpenExpenseTable}
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: showExpenseTable ? colors.button_hover : colors.button_bg,
              color: colors.button_text,
              "&:hover": { backgroundColor: colors.button_hover },
            }}
          >
            {expenseButtonLabel}
          </Button>
        </div>

        {showBudgetTable && !showExpenseTable && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold" style={{ color: colors.primary_text }}>
                {t("billCommon.budgets.heading")}
              </h3>
              <IconButton
                onClick={handleCloseBudgetTable}
                sx={{ color: "#ff4444", "&:hover": { backgroundColor: "#ff444420" } }}
              >
                <CloseIcon />
              </IconButton>
            </div>
            {budgetError && (
              <div className="text-red-500 text-sm mb-4">
                {t("billCommon.budgets.errorMessage", {
                  message: budgetError.message || t("billCommon.budgets.fallbackError"),
                })}
              </div>
            )}
            {budgetLoading ? (
              <div className="flex justify-center items-center py-8">
                <CircularProgress sx={{ color: colors.primary_accent }} />
              </div>
            ) : budgets.length === 0 ? (
              <div
                className="text-center py-8 rounded border"
                style={{
                  color: colors.icon_muted,
                  backgroundColor: colors.secondary_bg,
                  borderColor: colors.border_color,
                }}
              >
                {t("billCommon.budgets.noBudgets")}
              </div>
            ) : (
              <BudgetSelectionTable
                budgets={budgets}
                selectedBudgetIds={selectedBudgets}
                onSelectionChange={setSelectedBudgets}
              />
            )}
          </div>
        )}

        {showExpenseTable && !showBudgetTable && (
          <BillExpenseTable
            tempExpenses={tempExpenses}
            onTempExpenseChange={handleTempExpenseChange}
            onItemNameChange={handleItemNameChange}
            onAddRow={addTempExpenseRow}
            onRemoveRow={removeTempExpenseRow}
            onSave={handleSaveExpenses}
            onClose={handleCloseExpenseTableWithConfirmation}
            colors={colors}
            currencySymbol={currencySymbol}
            t={t}
            lastRowRef={lastRowRef}
            expenseTableTitle={expenseTableTitle}
            {...(isEditMode && {
              saveLabelKey: "billCommon.actions.saveChanges",
              validationHintKey: "billCommon.expenseTable.validationHintSimple",
            })}
          />
        )}

        {!showExpenseTable && !showBudgetTable && (
          <BillExpenseSummary
            expenses={expenses}
            colors={colors}
            currencySymbol={currencySymbol}
            t={t}
            emptyTitle={t("billCommon.summary.noItemsTitle")}
            emptySubtitle={emptySubtitle}
          />
        )}

        {hasWriteAccess && (
          <div className="w-full flex justify-end mt-4 sm:mt-8">
            <SubmitButton
              onClick={handleSubmit}
              label={submitLabel}
              isSubmitting={billLoading}
              colors={colors}
            />
          </div>
        )}
      </FormPageShell>

      {isCreateMode && (
        <ReceiptScanModal
          isOpen={showReceiptScanModal}
          onClose={() => setShowReceiptScanModal(false)}
          onDataExtracted={handleOcrDataExtracted}
        />
      )}
    </>
  );
}
